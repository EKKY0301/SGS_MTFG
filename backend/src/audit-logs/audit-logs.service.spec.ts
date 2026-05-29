import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  const prisma = {
    auditLog: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AuditLogsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an audit log', () => {
    const dto = { entity: 'User' } as any;
    service.create(dto);
    expect(prisma.auditLog.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should search audit logs', async () => {
    prisma.auditLog.count.mockResolvedValue(1);
    prisma.auditLog.findMany.mockResolvedValue([{ id: 'a1' }]);

    const result = await service.search({ filters: {}, paginationData: {} } as any);

    expect(result.total).toBe(1);
    expect(result.data).toEqual([{ id: 'a1' }]);
  });

  it('should find one audit log', () => {
    service.findOne('1');
    expect(prisma.auditLog.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: '1' } }));
  });

  it('should update and delete audit logs', async () => {
    await service.update('1', {} as any);
    await service.delete('1');

    expect(prisma.auditLog.update).toHaveBeenCalledWith({ where: { id: '1' }, data: {} });
    expect(prisma.auditLog.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});