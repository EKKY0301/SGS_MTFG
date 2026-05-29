import { Test, TestingModule } from '@nestjs/testing';
import { RentalsService } from './rentals.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('RentalsService', () => {
  let service: RentalsService;
  const prisma = {
    rental: {
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
        RentalsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
      ],
    }).compile();

    service = module.get(RentalsService);
    jest.clearAllMocks();
  });

  it('should create and search rentals', async () => {
    prisma.rental.create.mockResolvedValue({ id: 'r1' });
    prisma.rental.count.mockResolvedValue(1);
    prisma.rental.findMany.mockResolvedValue([{ id: 'r1' }]);

    await expect(service.create({} as any, 'u1')).resolves.toEqual({ id: 'r1' });
    await expect(service.search({ filters: {}, paginationData: {} } as any)).resolves.toMatchObject({ total: 1 });
  });

  it('should find, update and delete rentals', async () => {
    prisma.rental.findUnique.mockResolvedValue({ id: 'r1' });
    prisma.rental.update.mockResolvedValue({ id: 'r1', status: 'updated' });
    prisma.rental.delete.mockResolvedValue({ id: 'r1' });

    await expect(service.findOne('r1')).resolves.toEqual({ id: 'r1' });
    await expect(service.update('r1', {} as any, 'u1')).resolves.toEqual({ id: 'r1', status: 'updated' });
    await expect(service.delete('r1', 'u1')).resolves.toEqual({ id: 'r1' });
    expect(auditLogs.create).toHaveBeenCalled();
  });
});