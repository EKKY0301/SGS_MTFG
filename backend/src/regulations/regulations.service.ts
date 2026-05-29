import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateRegulationDto } from './dto/create-regulation.dto';
import { UpdateRegulationDto } from './dto/update-regulation.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { PaginationDataDto } from '../shared/dto/pagination-data.dto';
import { ReturnInListRegulationDTO } from './dto/return-list-regulation.dto';
import { promises as fs } from 'fs';
import { basename, join } from 'path';

@Injectable()
export class RegulationsService {
  constructor(private prisma: PrismaService, private readonly auditLogs: AuditLogsService) {}

  private readonly uploadDir = join(process.cwd(), 'uploads', 'regulations');

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

  async create(data: CreateRegulationDto, userId: string) {
    const created = await this.prisma.regulation.create({ data });
    await this.auditLogs.create({
      userId,
      entity: 'Regulation',
      entityId: created.id,
      action: 'create',
      newValues: data as any,
    });
    return created;
  }

  async createWithPdf(data: CreateRegulationDto, file: any, userId: string) {
    if (!file) {
      throw new NotFoundException('Archivo PDF requerido');
    }

    if ((file.mimetype ?? '').toLowerCase() !== 'application/pdf') {
      throw new NotFoundException('Solo se permiten archivos PDF');
    }

    await fs.mkdir(this.uploadDir, { recursive: true });
    const safeOriginalName = String(file.originalname ?? 'normativa.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedName = `${Date.now()}_${safeOriginalName}`;
    const absolutePath = join(this.uploadDir, storedName);

    await fs.writeFile(absolutePath, file.buffer);

    return this.create(
      {
        ...data,
        fileName: safeOriginalName,
        filePath: `/uploads/regulations/${storedName}`,
      },
      userId,
    );
  }

  async findAll() {
    return this.prisma.regulation.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.regulation.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Regulation with id ${id} not found`);
    }

    return record;
  }

  async getDownloadInfo(id: string) {
    const record = await this.findOne(id);

    if (!record.filePath) {
      throw new NotFoundException('Esta normativa no tiene archivo adjunto');
    }

    const fileNameOnDisk = basename(record.filePath);
    const absolutePath = join(this.uploadDir, fileNameOnDisk);

    await fs.access(absolutePath);

    return {
      absolutePath,
      fileName: record.fileName ?? fileNameOnDisk,
    };
  }

  async update(id: string, data: UpdateRegulationDto, userId: string) {
    await this.findOne(id);

    const updated = await this.prisma.regulation.update({
      where: { id },
      data,
    });

    await this.auditLogs.create({
      userId,
      entity: 'Regulation',
      entityId: id,
      action: 'update',
      newValues: data as any,
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);

    const deleted = await this.prisma.regulation.update({
      where: { id },
      data: { isActive: false },
    });

    await this.auditLogs.create({
      userId,
      entity: 'Regulation',
      entityId: id,
      action: 'delete',
    });

    return deleted;
  }

  async search(body: SearchListDto): Promise<ReturnInListRegulationDTO> {
    const { page, limit, skip } = this.resolvePagination(body.paginationData);
    const filters = body.filters ?? {};
    const where: any = { isActive: true };

    if (filters.search) {
      where.OR = [{ title: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }];
    }

    if (filters.filter) {
      where.type = filters.filter;
    }

    const [data, total] = await Promise.all([
      this.prisma.regulation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.regulation.count({ where }),
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

