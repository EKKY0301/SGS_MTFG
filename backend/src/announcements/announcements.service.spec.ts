import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  const prisma = {
    announcement: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const auditLogs = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
      ],
    }).compile();

    service = module.get(AnnouncementsService);
    jest.clearAllMocks();
  });

  it('should create and log an announcement', async () => {
    prisma.announcement.create.mockResolvedValue({ id: 'a1' });

    const result = await service.create({ title: 'A' } as any, 'u1');

    expect(result).toEqual({ id: 'a1' });
    expect(auditLogs.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'u1', entity: 'Announcement' }));
  });

  it('should search announcements', async () => {
    prisma.announcement.count.mockResolvedValue(1);
    prisma.announcement.findMany.mockResolvedValue([{ id: 'a1' }]);

    const result = await service.search({ filters: {}, paginationData: {} } as any);

    expect(result.total).toBe(1);
    expect(result.data).toEqual([{ id: 'a1' }]);
  });

  it('should find update and delete an announcement', async () => {
    prisma.announcement.findUnique.mockResolvedValue({ id: 'a1' });
    prisma.announcement.update.mockResolvedValue({ id: 'a1', title: 'B' });
    prisma.announcement.delete.mockResolvedValue({ id: 'a1' });

    await service.findOne('a1');
    await service.update('a1', { title: 'B' } as any, 'u1');
    await service.delete('a1', 'u1');

    expect(prisma.announcement.findUnique).toHaveBeenCalledWith({ where: { id: 'a1' } });
    expect(prisma.announcement.update).toHaveBeenCalled();
    expect(prisma.announcement.delete).toHaveBeenCalled();
    expect(auditLogs.create).toHaveBeenCalled();
  });
});