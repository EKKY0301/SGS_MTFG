import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('GroupsService', () => {
  let service: GroupsService;
  const prisma = {
    group: {
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
        GroupsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
      ],
    }).compile();

    service = module.get(GroupsService);
    jest.clearAllMocks();
  });

  it('should create, find and update groups', async () => {
    prisma.group.create.mockResolvedValue({ id: 'g1' });
    prisma.group.findMany.mockResolvedValue([{ id: 'g1' }]);
    prisma.group.count.mockResolvedValue(1);
    prisma.group.findUnique.mockResolvedValue({ id: 'g1' });
    prisma.group.update.mockResolvedValue({ id: 'g1', name: 'Updated' });
    prisma.group.delete.mockResolvedValue({ id: 'g1' });

    await expect(service.create({} as any, 'u1')).resolves.toEqual({ id: 'g1' });
    await expect(service.findAll()).resolves.toEqual([{ id: 'g1' }]);
    await expect(service.search({ filters: {}, paginationData: {} } as any)).resolves.toMatchObject({ total: 1 });
    await expect(service.findOne('g1')).resolves.toEqual({ id: 'g1' });
    await expect(service.update('g1', {} as any, 'u1')).resolves.toEqual({ id: 'g1', name: 'Updated' });
    await expect(service.delete('g1', 'u1')).resolves.toEqual({ id: 'g1' });

    expect(auditLogs.create).toHaveBeenCalled();
  });
});