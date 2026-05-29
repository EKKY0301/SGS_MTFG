import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { PaginationDataDto } from '../shared/dto/pagination-data.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private readonly auditLogs: AuditLogsService) {}

  private sanitizeAuditValues<T extends Record<string, any> | null | undefined>(values: T): T {
    if (!values) {
      return values;
    }

    const clone = { ...values } as Record<string, any>;
    if ('password' in clone) {
      delete clone.password;
    }

    return clone as T;
  }

  private resolvePagination(pagination?: PaginationDataDto) {
    const page = Number(pagination?.page ?? pagination?.currentPage) || 1;
    const rawLimit = Number(pagination?.itemsPerPage) || 10;
    const limit = Math.min(10, Math.max(1, rawLimit));

    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  async create(data: CreateUserDto, userId: string) {
    const created = await this.prisma.user.create({ data });
    await this.auditLogs.create({
      userId,
      entity: 'User',
      entityId: created.id,
      action: 'create',
      newValues: this.sanitizeAuditValues(data as any) as any,
    });
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
      where.OR = [{ username: { contains: filters.search, mode: 'insensitive' } }];
    }

    if (filters.filter) {
      where.isActive = filters.filter.toLowerCase() === 'active';
    }

    const total = await this.prisma.user.count({ where });
    const data = await this.prisma.user.findMany({
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
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateUserDto, userId: string) {
    const old = await this.prisma.user.findUnique({ where: { id } });
    const updated = await this.prisma.user.update({ where: { id }, data });
    await this.auditLogs.create({
      userId,
      entity: 'User',
      entityId: id,
      action: 'update',
      oldValues: this.sanitizeAuditValues(old as any) as any,
      newValues: this.sanitizeAuditValues(data as any) as any,
    });
    return updated;
  }

  async delete(id: string, userId: string) {
    const old = await this.prisma.user.findUnique({ where: { id } });
    const deleted = await this.prisma.user.delete({ where: { id } });
    await this.auditLogs.create({
      userId,
      entity: 'User',
      entityId: id,
      action: 'delete',
      oldValues: this.sanitizeAuditValues(old as any) as any,
    });
    return deleted;
  }
}
