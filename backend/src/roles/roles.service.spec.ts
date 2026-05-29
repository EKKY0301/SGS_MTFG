import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('RolesService', () => {
  let service: RolesService;
  const prisma = {
    role: {
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
        RolesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
      ],
    }).compile();

    service = module.get(RolesService);
    jest.clearAllMocks();
  });

  it('should create and search roles', async () => {
    prisma.role.create.mockResolvedValue({ id: 'r1' });
    prisma.role.count.mockResolvedValue(1);
    prisma.role.findMany.mockResolvedValue([{ id: 'r1' }]);

    await expect(service.create({} as any, 'u1')).resolves.toEqual({ id: 'r1' });
    await expect(service.search({ filters: {}, paginationData: {} } as any)).resolves.toMatchObject({ total: 1 });
  });

  it('should find, update and delete roles', async () => {
    prisma.role.findUnique.mockResolvedValue({ id: 'r1' });
    prisma.role.update.mockResolvedValue({ id: 'r1', name: 'Updated' });
    prisma.role.delete.mockResolvedValue({ id: 'r1' });

    await expect(service.findOne('r1')).resolves.toEqual({ id: 'r1' });
    await expect(service.update('r1', {} as any, 'u1')).resolves.toEqual({ id: 'r1', name: 'Updated' });
    await expect(service.delete('r1', 'u1')).resolves.toEqual({ id: 'r1' });
    expect(auditLogs.create).toHaveBeenCalled();
  });
});