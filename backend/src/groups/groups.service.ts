import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { PaginationDataDto } from '../shared/dto/pagination-data.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService, private readonly auditLogs: AuditLogsService) {}

  private resolvePagination(pagination?: PaginationDataDto) {
    const page = Number(pagination?.page) || 1;
    const rawLimit = Number(pagination?.itemsPerPage) || 10;
    const limit = Math.max(1, rawLimit);

    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  async create(data: CreateGroupDto, userId: string) {
    const created = await this.prisma.group.create({ data });
    await this.auditLogs.create({ userId, entity: 'Group', entityId: created.id, action: 'create', newValues: data as any });
    return created;
  }

  async findAll() {
    const data = await this.prisma.group.findMany({ orderBy: { createdAt: 'asc' } });
    return data;
  }

  async search(body: SearchListDto) {
    const { page, limit, skip } = this.resolvePagination(body.paginationData);
    const filters = body.filters ?? {};
    const where: any = {};

    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters.filter) {
      where.name = { contains: filters.filter, mode: 'insensitive' };
    }

    const total = await this.prisma.group.count({ where });
    const data = await this.prisma.group.findMany({
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
    return this.prisma.group.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateGroupDto, userId: string) {
    const old = await this.prisma.group.findUnique({ where: { id } });
    const updated = await this.prisma.group.update({ where: { id }, data });
    await this.auditLogs.create({ userId, entity: 'Group', entityId: id, action: 'update', oldValues: old as any, newValues: data as any });
    return updated;
  }

  async delete(id: string, userId: string) {
    const old = await this.prisma.group.findUnique({ where: { id } });
    const deleted = await this.prisma.group.delete({ where: { id } });
    await this.auditLogs.create({ userId, entity: 'Group', entityId: id, action: 'delete', oldValues: old as any });
    return deleted;
  }
}
