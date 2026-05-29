import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { PaginationDataDto } from '../shared/dto/pagination-data.dto';
import { ReturnInListEventDTO } from './dto/return-list-event.dto';
import PDFDocument from 'pdfkit';

type EventParticipantRow = {
  memberNumber: string;
  fullName: string;
  companionsCount: number;
  companions: string[];
};

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService, private readonly auditLogs: AuditLogsService) {}

  private normalizeDateOnlyToUtcNoon(value: unknown): Date | undefined {
    if (!value) return undefined;

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? undefined : value;
    }

    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) return undefined;

    const dateOnlyMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]);
      const day = Number(dateOnlyMatch[3]);
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    }

    const parsedDate = new Date(trimmedValue);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }

  private withNormalizedEventDate<T extends { date?: unknown }>(data: T): T {
    const normalizedDate = this.normalizeDateOnlyToUtcNoon(data.date);
    if (!normalizedDate) {
      return data;
    }

    return {
      ...data,
      date: normalizedDate,
    };
  }

  private toPdfSafeText(value: unknown): string {
    const text = value == null ? '' : String(value);
    return text
      .normalize('NFKC')
      .replace(/[\u0100-\uFFFF]/g, '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }


  private resolvePagination(pagination?: PaginationDataDto) {
    const page = Number(pagination?.page) || 1;
    const rawLimit = Number( pagination?.itemsPerPage) || 10;
    const limit = Math.min(10, Math.max(1, rawLimit));

    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  async create(data: CreateEventDto, userId: string) {
    const normalizedData = this.withNormalizedEventDate(data as any) as CreateEventDto;
    const created = await this.prisma.event.create({ data: normalizedData });
    await this.auditLogs.create({ userId, entity: 'Event', entityId: created.id, action: 'create', newValues: normalizedData as any });
    return created;
  }

  findAll() {
    return this.prisma.event.findMany({ orderBy: { date: 'asc' } });
  }

  async search(body: SearchListDto): Promise<ReturnInListEventDTO> {
    const { page, limit, skip } = this.resolvePagination(body.paginationData);
    const filters = body.filters ?? {};
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.filter) {
      where.location = { contains: filters.filter, mode: 'insensitive' };
    }

    const total = await this.prisma.event.count({ where });
    const data = await this.prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {attendances: true}
    });

    return {
      paginationData: {
        page: page,
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
      },
      items: data.map(event => {
        return {
          id: event.id,
          name: event.name,
          description: event.description ?? '',
          date: event.date,
          location: event.location ?? '',
          maxCapacity: event.maxCapacity ?? 0,
          organizedBy: event.organizedBy ?? '',
          attendances: event.attendances.length,
        }
      }),
    };
  }

  async exportSearchAsPdf(body: SearchListDto): Promise<{ buffer: Buffer; fileName: string }> {
    const pageSize = 500;
    const allItems: ReturnInListEventDTO['items'] = [];
    let page = 1;
    let totalItems = 0;

    while (true) {
      const pageResult = await this.search({
        paginationData: {
          page,
          itemsPerPage: pageSize,
        },
        filters: body.filters ?? {},
      });

      if (page === 1) {
        totalItems = pageResult.paginationData.totalItems ?? 0;
      }

      allItems.push(...pageResult.items);

      if (allItems.length >= totalItems || pageResult.items.length === 0) {
        break;
      }

      page += 1;
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    const pdfDone = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    doc.fontSize(18).text('Lista de eventos (busqueda actual)', { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(10).text(`Fecha de exportacion: ${new Date().toLocaleString('es-PY')}`);
    doc.text(`Resultados en esta exportacion: ${allItems.length}`);
    doc.moveDown(0.8);

    const filtersSummary = Object.entries(body.filters ?? {})
      .filter(([, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null && `${value}` !== '';
      })
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join(' | ');

    doc.fontSize(10).text(`Filtros: ${filtersSummary || 'Sin filtros'}`);
    doc.moveDown(0.8);

    const drawHeader = () => {
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Evento', 40, doc.y, { width: 190 });
      doc.text('Fecha', 230, doc.y - 12, { width: 80 });
      doc.text('Ubicacion', 310, doc.y - 12, { width: 140 });
      doc.text('Capacidad', 450, doc.y - 12, { width: 80 });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(0.6);
    };

    const ensureSpaceForRow = () => {
      if (doc.y > 760) {
        doc.addPage();
        drawHeader();
      }
    };

    drawHeader();

    for (const item of allItems) {
      ensureSpaceForRow();

      const eventDate = item.date instanceof Date ? item.date : new Date(item.date);
      const dateFormatted = Number.isNaN(eventDate.getTime()) ? '-' : eventDate.toISOString().split('T')[0];
      const name = this.toPdfSafeText(item.name ?? '-') || '-';
      const location = this.toPdfSafeText(item.location ?? '-') || '-';

      doc.text(name, 40, doc.y, { width: 190 });
      doc.text(dateFormatted, 230, doc.y - 12, { width: 80 });
      doc.text(location, 310, doc.y - 12, { width: 140 });
      doc.text(`${item.attendances ?? 0} / ${item.maxCapacity ?? 0}`, 450, doc.y - 12, { width: 80 });
      doc.moveDown(0.4);
    }

    doc.moveDown(0.8);
    doc.fontSize(10).font('Helvetica-Bold').text(`Total exportado: ${allItems.length}`);

    doc.end();

    const buffer = await pdfDone;
    const fileName = `eventos_busqueda_${new Date().toISOString().slice(0, 10)}.pdf`;

    return { buffer, fileName };
  }

  private buildMemberFullName(member?: {
    name?: string | null;
    japaneseName?: string | null;
    surname?: string | null;
    japaneseSurname?: string | null;
  } | null): string {
    const parts = [member?.name, member?.japaneseName, member?.surname, member?.japaneseSurname]
      .map((part) => (part ?? '').trim())
      .filter((part) => part.length > 0);

    return parts.join(' ') || '-';
  }

  private buildParticipantRows(attendances: Array<{
    member?: {
      memberNumber?: number | null;
      name?: string | null;
      surname?: string | null;
      japaneseName?: string | null;
      japaneseSurname?: string | null;
      adminParent?: {
        memberNumber?: number | null;
      } | null;
    } | null;
  }>): EventParticipantRow[] {
    const rows: EventParticipantRow[] = [];

    for (const attendance of attendances) {
      const member = attendance.member;
      const fullName = this.buildMemberFullName(member);
      const memberNumber = member?.memberNumber != null ? `${member.memberNumber}` : '-';
      const adminParentNumber = member?.adminParent?.memberNumber;

      if (adminParentNumber == null) {
        rows.push({
          memberNumber,
          fullName,
          companionsCount: 0,
          companions: [],
        });
        continue;
      }

      const parentRowIndex = rows.findIndex((row) => row.memberNumber === `${adminParentNumber}`);

      if (parentRowIndex >= 0) {
        rows[parentRowIndex].companionsCount += 1;
        rows[parentRowIndex].companions.push(fullName);
        continue;
      }

      rows.push({
        memberNumber,
        fullName,
        companionsCount: 0,
        companions: [],
      });
    }

    return rows;
  }

  async exportEventDetailAsPdf(id: string): Promise<{ buffer: Buffer; fileName: string }> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        attendances: {
          include: {
            member: {
              select: {
                memberNumber: true,
                name: true,
                surname: true,
                japaneseName: true,
                japaneseSurname: true,
                adminParent: {
                  select: {
                    memberNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    const participantRows = this.buildParticipantRows(event.attendances);
    const eventDate = new Date(event.date);
    const createdAt = new Date(event.createdAt);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    const pdfDone = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const left = 40;
    const tableRight = 555;
    const pageBottom = 760;

    doc.fontSize(18).font('Helvetica-Bold').text('Detalle del evento', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica');
    doc.text(`Nombre: ${this.toPdfSafeText(event.name) || '-'}`);
    doc.text(`Fecha: ${Number.isNaN(eventDate.getTime()) ? '-' : eventDate.toLocaleDateString('es-PY')}`);
    doc.text(`Ubicacion: ${this.toPdfSafeText(event.location) || '-'}`);
    doc.text(`Descripcion: ${this.toPdfSafeText(event.description) || '-'}`);
    doc.text(`Organizado por: ${this.toPdfSafeText(event.organizedBy) || '-'}`);
    doc.text(`Capacidad maxima: ${event.maxCapacity ?? '-'}`);
    doc.text(`Asistencias registradas: ${event.attendances.length}`);
    doc.text(`Creado: ${Number.isNaN(createdAt.getTime()) ? '-' : createdAt.toLocaleString('es-PY')}`);
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold').fontSize(12).text('Participantes');
    doc.moveDown(0.3);

    const columns = {
      memberNumber: { x: left, width: 70 },
      fullName: { x: 110, width: 170 },
      companionsCount: { x: 285, width: 70 },
      companions: { x: 360, width: 195 },
    };

    const drawHeader = () => {
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Nro socio', columns.memberNumber.x, doc.y, { width: columns.memberNumber.width });
      doc.text('Nombre', columns.fullName.x, doc.y - 12, { width: columns.fullName.width });
      doc.text('Acomp.', columns.companionsCount.x, doc.y - 12, { width: columns.companionsCount.width });
      doc.text('Lista de acompanantes', columns.companions.x, doc.y - 12, { width: columns.companions.width });
      doc.moveDown(0.4);
      doc.moveTo(left, doc.y).lineTo(tableRight, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(0.4);
      doc.font('Helvetica').fontSize(10);
    };

    const ensureSpace = (requiredHeight: number) => {
      if (doc.y + requiredHeight > pageBottom) {
        doc.addPage();
        drawHeader();
      }
    };

    drawHeader();

    if (participantRows.length === 0) {
      doc.text('No hay participantes registrados.', left, doc.y);
    } else {
      for (const row of participantRows) {
        const companionsTextRaw = row.companions.length > 0 ? row.companions.join(', ') : '-';
        const companionsText = this.toPdfSafeText(companionsTextRaw) || '-';
        const numberText = this.toPdfSafeText(row.memberNumber || '-') || '-';
        const fullName = this.toPdfSafeText(row.fullName) || '-';
        const countText = `${row.companionsCount}`;

        const height = Math.max(
          doc.heightOfString(numberText, { width: columns.memberNumber.width }),
          doc.heightOfString(fullName, { width: columns.fullName.width }),
          doc.heightOfString(countText, { width: columns.companionsCount.width }),
          doc.heightOfString(companionsText, { width: columns.companions.width }),
          14,
        );

        ensureSpace(height + 10);

        const rowStartY = doc.y;
        doc.text(numberText, columns.memberNumber.x, rowStartY, { width: columns.memberNumber.width });
        doc.text(fullName, columns.fullName.x, rowStartY, { width: columns.fullName.width });
        doc.text(countText, columns.companionsCount.x, rowStartY, { width: columns.companionsCount.width });
        doc.text(companionsText, columns.companions.x, rowStartY, { width: columns.companions.width });

        const lineY = rowStartY + height + 4;
        doc.moveTo(left, lineY).lineTo(tableRight, lineY).strokeColor('#efefef').stroke();
        doc.y = lineY + 4;
      }
    }

    doc.moveDown(0.8);
    doc.fontSize(10).font('Helvetica-Bold').text(`Total de filas exportadas: ${participantRows.length}`);
    doc.fontSize(9).font('Helvetica').text(`Documento generado el ${new Date().toLocaleString('es-PY')}`);

    doc.end();

    const buffer = await pdfDone;
    const safeEventName = (event.name ?? 'evento')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40);
    const fileName = `evento_${safeEventName || 'detalle'}_${new Date().toISOString().slice(0, 10)}.pdf`;

    return { buffer, fileName };
  }

  findOne(id: string) {
    return this.prisma.event.findUnique({ where: { id }, include: { attendances: {include:{member:{select:{id:true, name:true, surname:true, japaneseName:true, japaneseSurname:true, memberNumber:true, adminParent:{select:{memberNumber: true}}}}}} } });
  }

  async update(id: string, data: UpdateEventDto, userId: string) {
    const old = await this.prisma.event.findUnique({ where: { id } });
    const normalizedData = this.withNormalizedEventDate(data as any) as UpdateEventDto;
    const updated = await this.prisma.event.update({ where: { id }, data: normalizedData });
    await this.auditLogs.create({ userId, entity: 'Event', entityId: id, action: 'update', oldValues: old as any, newValues: normalizedData as any });
    return updated;
  }

  async delete(id: string, userId: string) {
    const old = await this.prisma.event.findUnique({ where: { id } });
    const deleted = await this.prisma.event.delete({ where: { id } });
    await this.auditLogs.create({ userId, entity: 'Event', entityId: id, action: 'delete', oldValues: old as any });
    return deleted;
  }
}
