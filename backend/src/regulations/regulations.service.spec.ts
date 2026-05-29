import { Test, TestingModule } from '@nestjs/testing';
import { RegulationsService } from './regulations.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('RegulationsService', () => {
  let service: RegulationsService;
  const prisma = {
    regulation: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const auditLogs = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegulationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
      ],
    }).compile();

    service = module.get(RegulationsService);
    jest.clearAllMocks();
  });

  it('should create and search regulations', async () => {
    prisma.regulation.create.mockResolvedValue({ id: 'r1' });
    prisma.regulation.count.mockResolvedValue(1);
    prisma.regulation.findMany.mockResolvedValue([{ id: 'r1' }]);

    await expect(service.create({} as any, 'u1')).resolves.toEqual({ id: 'r1' });
    await expect(service.search({ filters: {}, paginationData: {} } as any)).resolves.toMatchObject({ paginationData: { totalItems: 1 } });
  });

  it('should find, update and remove regulations', async () => {
    prisma.regulation.findUnique.mockResolvedValue({ id: 'r1', filePath: '/uploads/regulations/doc.pdf' });
    prisma.regulation.update.mockResolvedValue({ id: 'r1', title: 'Updated' });

    await expect(service.findOne('r1')).resolves.toEqual(expect.objectContaining({ id: 'r1' }));
    await expect(service.update('r1', {} as any, 'u1')).resolves.toEqual({ id: 'r1', title: 'Updated' });
    prisma.regulation.update.mockResolvedValueOnce({ id: 'r1', isActive: false });
    await expect(service.remove('r1', 'u1')).resolves.toEqual({ id: 'r1', isActive: false });
    expect(auditLogs.create).toHaveBeenCalled();
  });

  it('should handle pdf and download errors', async () => {
    await expect(service.createWithPdf({} as any, null, 'u1')).rejects.toThrow('Archivo PDF requerido');
    await expect(service.createWithPdf({} as any, { mimetype: 'text/plain' }, 'u1')).rejects.toThrow('Solo se permiten archivos PDF');

    prisma.regulation.findUnique.mockResolvedValueOnce({ id: 'r1', filePath: null });
    await expect(service.getDownloadInfo('r1')).rejects.toThrow('Esta normativa no tiene archivo adjunto');
  });
});