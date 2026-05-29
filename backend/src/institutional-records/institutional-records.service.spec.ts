import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionalRecordsService } from './institutional-records.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('InstitutionalRecordsService', () => {
  let service: InstitutionalRecordsService;
  const prisma = {
    institutionalRecord: {
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
        InstitutionalRecordsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
      ],
    }).compile();

    service = module.get(InstitutionalRecordsService);
    jest.clearAllMocks();
  });

  it('should create and search records', async () => {
    prisma.institutionalRecord.create.mockResolvedValue({ id: 'i1' });
    prisma.institutionalRecord.count.mockResolvedValue(1);
    prisma.institutionalRecord.findMany.mockResolvedValue([{ id: 'i1' }]);

    await expect(service.create({} as any, 'u1')).resolves.toEqual({ id: 'i1' });
    await expect(service.search({ filters: {}, paginationData: {} } as any)).resolves.toMatchObject({ paginationData: { totalItems: 1 } });
  });

  it('should find, update and remove records', async () => {
    prisma.institutionalRecord.findUnique.mockResolvedValue({ id: 'i1', filePath: '/uploads/institutional-records/doc.pdf' });
    prisma.institutionalRecord.update.mockResolvedValue({ id: 'i1', title: 'Updated' });
    prisma.institutionalRecord.delete.mockResolvedValue({ id: 'i1' });

    await expect(service.findOne('i1')).resolves.toEqual(expect.objectContaining({ id: 'i1' }));
    await expect(service.update('i1', {} as any, 'u1')).resolves.toEqual({ id: 'i1', title: 'Updated' });
    await expect(service.remove('i1', 'u1')).resolves.toEqual({ id: 'i1' });
    expect(auditLogs.create).toHaveBeenCalled();
  });

  it('should handle pdf and download errors', async () => {
    await expect(service.createWithPdf({} as any, null, 'u1')).rejects.toThrow('Archivo PDF requerido');
    await expect(service.createWithPdf({} as any, { mimetype: 'text/plain' }, 'u1')).rejects.toThrow('Solo se permiten archivos PDF');

    prisma.institutionalRecord.findUnique.mockResolvedValueOnce({ id: 'i1', filePath: null });
    await expect(service.getDownloadInfo('i1')).rejects.toThrow('Este registro no tiene archivo adjunto');
  });
});