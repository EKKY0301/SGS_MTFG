import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { PaginationDataDto } from '../shared/dto/pagination-data.dto';
import PDFDocument from 'pdfkit';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  private resolvePagination(pagination?: PaginationDataDto) {
    const page = Number(pagination?.page) || 1;
    const rawLimit = Number(pagination?.itemsPerPage) || 10;
    const limit = Math.min(10, Math.max(1, rawLimit));

    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  create(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({ data });
  }

  findAll(query: ListRequestDto) {
    return this.search({
      paginationData: query,
      filters: {
        search: query.search,
        filter: query.filter,
      },
    });
  }

  async search(body: SearchListDto) {
    const { page, limit, skip } = this.resolvePagination(body.paginationData);
    const filters = body.filters ?? {};
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { entity: { contains: filters.search, mode: 'insensitive' } },
        { action: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.filter) {
      where.action = { contains: filters.filter, mode: 'insensitive' };
    }

    if (filters.from || filters.to) {
      where.createdAt = {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to ? { lte: new Date(filters.to) } : {}),
      };
    }

    const total = await this.prisma.auditLog.count({ where });
    const data = await this.prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true } } },
    });

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string) {
    return this.prisma.auditLog.findUnique({ where: { id }, include: { user: { select: { id: true, username: true } } } });
  }

  async exportSearchAsPdf(body: SearchListDto): Promise<{ buffer: Buffer; fileName: string }> {
    const now = new Date();
    const year = now.getFullYear();
    const from = body.filters?.from ?? `${year}-01-01T00:00:00.000Z`;
    const to = body.filters?.to ?? `${year}-12-31T23:59:59.999Z`;

    const effectiveFilters = {
      ...(body.filters ?? {}),
      from,
      to,
    };

    const allItems: any[] = [];
    let page = 1;
    let total = 0;

    while (true) {
      const pageResult = await this.search({
        paginationData: {
          page,
          itemsPerPage: 10,
        },
        filters: effectiveFilters,
      });

      if (page === 1) {
        total = pageResult.total;
      }

      allItems.push(...pageResult.data);

      if (allItems.length >= total || pageResult.data.length === 0) {
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

    doc.fontSize(18).text('Historial de auditoria', { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(10).text(`Fecha de exportacion: ${new Date().toLocaleString('es-PY')}`);
    doc.text(`Periodo: ${from.split('T')[0]} a ${to.split('T')[0]}`);
    doc.text(`Resultados en esta exportacion: ${allItems.length}`);
    doc.moveDown(0.8);

    const drawHeader = () => {
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Fecha', 40, doc.y, { width: 110 });
      doc.text('Usuario', 150, doc.y - 12, { width: 110 });
      doc.text('Entidad', 260, doc.y - 12, { width: 90 });
      doc.text('Accion', 350, doc.y - 12, { width: 85 });
      doc.text('ID Entidad', 435, doc.y - 12, { width: 120 });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(9);
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

      const createdAt = item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '-';
      const userName = item.user?.username ?? '-';

      doc.text(createdAt, 40, doc.y, { width: 110 });
      doc.text(userName, 150, doc.y - 12, { width: 110 });
      doc.text(item.entity ?? '-', 260, doc.y - 12, { width: 90 });
      doc.text(item.action ?? '-', 350, doc.y - 12, { width: 85 });
      doc.text(item.entityId ?? '-', 435, doc.y - 12, { width: 120 });
      doc.moveDown(0.4);
    }

    doc.moveDown(0.8);
    doc.fontSize(10).font('Helvetica-Bold').text(`Total exportado: ${allItems.length}`);
    doc.end();

    const buffer = await pdfDone;
    const fileName = `auditoria_${new Date().toISOString().slice(0, 10)}.pdf`;

    return { buffer, fileName };
  }

  update(id: string, data: UpdateAuditLogDto) {
    return this.prisma.auditLog.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.auditLog.delete({ where: { id } });
  }
}
