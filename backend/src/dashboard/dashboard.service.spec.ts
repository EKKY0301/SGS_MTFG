import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  const prisma = {
    event: { findMany: jest.fn() },
    member: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(DashboardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build overview from prisma queries', async () => {
    prisma.event.findMany.mockResolvedValue([{ id: 'e1' }]);
    prisma.member.findMany.mockResolvedValue([{ id: 'm1' }]);

    const result = await service.getOverview();

    expect(result.weeklyEvents).toEqual([{ id: 'e1' }]);
    expect(result.expiredMembers).toEqual([{ id: 'm1' }]);
    expect(prisma.event.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.member.findMany).toHaveBeenCalledTimes(1);
  });
});