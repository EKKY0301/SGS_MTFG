import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { UpdateEventAttendanceDto } from './dto/update-event-attendance.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { PaginationDataDto } from '../shared/dto/pagination-data.dto';

@Injectable()
export class EventAttendancesService {
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

  create(data: CreateEventAttendanceDto) {
    return this.prisma.eventAttendance.create({ data });
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
        { status: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.filter) {
      where.status = { contains: filters.filter, mode: 'insensitive' };
    }

    const total = await this.prisma.eventAttendance.count({ where });
    const data = await this.prisma.eventAttendance.findMany({
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
    return this.prisma.eventAttendance.findUnique({ where: { id } });
  }

  findByEventId(eventId: string) {
    return this.prisma.eventAttendance.findMany({
      where: { eventId },
      include: {
        member: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: UpdateEventAttendanceDto) {
    return this.prisma.eventAttendance.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.eventAttendance.delete({ where: { id } });
  }
}
