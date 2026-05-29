import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateInstitutionalRecordDto } from './dto/create-institutional-record.dto';
import { UpdateInstitutionalRecordDto } from './dto/update-institutional-record.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { PaginationDataDto } from '../shared/dto/pagination-data.dto';
import { ReturnInListInstitutionalRecordDTO } from './dto/return-list-institutional-record.dto';
import { promises as fs } from 'fs';
import { basename, join } from 'path';

@Injectable()
export class InstitutionalRecordsService {
  constructor(private prisma: PrismaService, private readonly auditLogs: AuditLogsService) {}

  private readonly uploadDir = join(process.cwd(), 'uploads', 'institutional-records');

  private resolvePagination(pagination?: PaginationDataDto) {
    const page = Number(pagination?.page) || 1;
    const rawLimit = Number(pagination?.itemsPerPage) || 10;
    const limit = Math.min(100, Math.max(1, rawLimit));

    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  async create(data: CreateInstitutionalRecordDto, userId: string) {
    const created = await this.prisma.institutionalRecord.create({ data });
    await this.auditLogs.create({
      userId,
      entity: 'InstitutionalRecord',
      entityId: created.id,
      action: 'create',
      newValues: data as any,
    });
    return created;
  }

  async createWithPdf(data: CreateInstitutionalRecordDto, file: any, userId: string) {
    if (!file) {
      throw new NotFoundException('Archivo PDF requerido');
    }

    if ((file.mimetype ?? '').toLowerCase() !== 'application/pdf') {
      throw new NotFoundException('Solo se permiten archivos PDF');
    }

    await fs.mkdir(this.uploadDir, { recursive: true });
    const safeOriginalName = String(file.originalname ?? 'documento.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedName = `${Date.now()}_${safeOriginalName}`;
    const absolutePath = join(this.uploadDir, storedName);

    await fs.writeFile(absolutePath, file.buffer);

    return this.create(
      {
        ...data,
        fileName: safeOriginalName,
        filePath: `/uploads/institutional-records/${storedName}`,
      },
      userId,
    );
  }

  async findAll() {
    return this.prisma.institutionalRecord.findMany({
      orderBy: { recordDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.institutionalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`InstitutionalRecord with id ${id} not found`);
    }

    return record;
  }

  async getDownloadInfo(id: string) {
    const record = await this.findOne(id);

    if (!record.filePath) {
      throw new NotFoundException('Este registro no tiene archivo adjunto');
    }

    const fileNameOnDisk = basename(record.filePath);
    const absolutePath = join(this.uploadDir, fileNameOnDisk);

    await fs.access(absolutePath);

    return {
      absolutePath,
      fileName: record.fileName ?? fileNameOnDisk,
    };
  }

  async update(id: string, data: UpdateInstitutionalRecordDto, userId: string) {
    await this.findOne(id);

    const updated = await this.prisma.institutionalRecord.update({
      where: { id },
      data,
    });

    await this.auditLogs.create({
      userId,
      entity: 'InstitutionalRecord',
      entityId: id,
      action: 'update',
      newValues: data as any,
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);

    const deleted = await this.prisma.institutionalRecord.delete({
      where: { id },
    });

    await this.auditLogs.create({
      userId,
      entity: 'InstitutionalRecord',
      entityId: id,
      action: 'delete',
    });

    return deleted;
  }

  async search(body: SearchListDto): Promise<ReturnInListInstitutionalRecordDTO> {
    const { page, limit, skip } = this.resolvePagination(body.paginationData);
    const filters = body.filters ?? {};
    const where: any = {};

    if (filters.search) {
      where.OR = [{ title: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }];
    }

    if (filters.filter) {
      where.type = filters.filter;
    }

    const [data, total] = await Promise.all([
      this.prisma.institutionalRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { recordDate: 'desc' },
      }),
      this.prisma.institutionalRecord.count({ where }),
    ]);

    return {
      items: data,
      paginationData: {
        page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
