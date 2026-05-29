import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { PaginationDataDto } from '../shared/dto/pagination-data.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService, private readonly auditLogs: AuditLogsService) {}

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

  async create(data: CreateAnnouncementDto, userId: string) {
    const created = await this.prisma.announcement.create({ data });
    this.auditLogs.create({ userId, entity: 'Announcement', entityId: created.id, action: 'create', newValues: data as any });
    return created;
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
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.filter) {
      where.title = { contains: filters.filter, mode: 'insensitive' };
    }

    const total = await this.prisma.announcement.count({ where });
    const data = await this.prisma.announcement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' },
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
    return this.prisma.announcement.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateAnnouncementDto, userId: string) {
    const old = await this.prisma.announcement.findUnique({ where: { id } });
    const updated = await this.prisma.announcement.update({ where: { id }, data });
    this.auditLogs.create({ userId, entity: 'Announcement', entityId: id, action: 'update', oldValues: old as any, newValues: data as any });
    return updated;
  }

  async delete(id: string, userId: string) {
    const old = await this.prisma.announcement.findUnique({ where: { id } });
    const deleted = await this.prisma.announcement.delete({ where: { id } });
    this.auditLogs.create({ userId, entity: 'Announcement', entityId: id, action: 'delete', oldValues: old as any });
    return deleted;
  }
}
