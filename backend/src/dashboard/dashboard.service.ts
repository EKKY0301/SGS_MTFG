import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    const normalizedDay = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - normalizedDay);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weeklyEvents = await this.prisma.event.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      include: {
        attendances: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const expiredMembers = await this.prisma.member.findMany({
      where: {
        deleted: false,
        documentExpDate: {
          not: null,
          lt: today,
        },
      },
      select: {
        id: true,
        name: true,
        surname: true,
        memberNumber: true,
        documentNumber: true,
        documentExpDate: true,
      },
      orderBy: {
        documentExpDate: 'asc',
      },
      take: 50,
    });

    return {
      weekRange: {
        start: weekStart,
        end: weekEnd,
      },
      weeklyEvents,
      expiredMembers,
    };
  }
}
