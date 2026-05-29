import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { PaginationDataDto } from '../shared/dto/pagination-data.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ResourcesService {
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

  async create(data: CreateResourceDto, userId: string) {
    const created = await this.prisma.resource.create({ data });
    await this.auditLogs.create({ userId, entity: 'Resource', entityId: created.id, action: 'create', newValues: data as any });
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
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { status: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.filter) {
      where.status = { contains: filters.filter, mode: 'insensitive' };
    }

    const total = await this.prisma.resource.count({ where });
    const data = await this.prisma.resource.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
    return this.prisma.resource.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateResourceDto, userId: string) {
    const old = await this.prisma.resource.findUnique({ where: { id } });
    const updated = await this.prisma.resource.update({ where: { id }, data });
    await this.auditLogs.create({ userId, entity: 'Resource', entityId: id, action: 'update', oldValues: old as any, newValues: data as any });
    return updated;
  }

  async delete(id: string, userId: string) {
    const old = await this.prisma.resource.findUnique({ where: { id } });
    const deleted = await this.prisma.resource.delete({ where: { id } });
    await this.auditLogs.create({ userId, entity: 'Resource', entityId: id, action: 'delete', oldValues: old as any });
    return deleted;
  }
}
