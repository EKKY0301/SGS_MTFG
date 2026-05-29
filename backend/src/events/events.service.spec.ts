import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('EventsService', () => {
  let service: EventsService;
  const prisma = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const auditLogs = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
      ],
    }).compile();

    service = module.get(EventsService);
    jest.clearAllMocks();
  });

  it('should create, search, find, update and delete events', async () => {
    prisma.event.create.mockResolvedValue({ id: 'e1' });
    prisma.event.count.mockResolvedValue(1);
    prisma.event.findMany.mockResolvedValue([{ id: 'e1', attendances: [] }]);
    prisma.event.findUnique.mockResolvedValue({ id: 'e1', attendances: [], createdAt: new Date(), date: new Date() });
    prisma.event.update.mockResolvedValue({ id: 'e1', name: 'Updated' });
    prisma.event.delete.mockResolvedValue({ id: 'e1' });

    await expect(service.create({} as any, 'u1')).resolves.toEqual({ id: 'e1' });
    await expect(service.search({ filters: {}, paginationData: {} } as any)).resolves.toMatchObject({ paginationData: { totalItems: 1 } });
    await expect(service.findAll()).resolves.toEqual([{ id: 'e1', attendances: [] }]);
    await expect(service.findOne('e1')).resolves.toEqual(expect.objectContaining({ id: 'e1' }));
    await expect(service.update('e1', {} as any, 'u1')).resolves.toEqual({ id: 'e1', name: 'Updated' });
    await expect(service.delete('e1', 'u1')).resolves.toEqual({ id: 'e1' });

    expect(auditLogs.create).toHaveBeenCalled();
  });
});