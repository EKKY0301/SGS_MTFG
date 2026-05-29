import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  const auditLogsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    search: jest.fn(),
    exportSearchAsPdf: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [{ provide: AuditLogsService, useValue: auditLogsService }],
    }).compile();

    controller = module.get(AuditLogsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create to service', () => {
    const dto = { entity: 'User' } as any;
    controller.create(dto);
    expect(auditLogsService.create).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll to service', () => {
    controller.findAll();
    expect(auditLogsService.findAll).toHaveBeenCalledWith({});
  });

  it('should delegate search to service', () => {
    const body = { filters: {} } as any;
    controller.search(body);
    expect(auditLogsService.search).toHaveBeenCalledWith(body);
  });

  it('should delegate exportPdf and write response headers', async () => {
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as any;

    auditLogsService.exportSearchAsPdf.mockResolvedValue({ buffer: Buffer.from('pdf'), fileName: 'audit.pdf' });

    await controller.exportPdf({ filters: {} } as any, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="audit.pdf"');
    expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
  });

  it('should delegate update and delete', () => {
    controller.update('1', {} as any);
    controller.delete('1');
    expect(auditLogsService.update).toHaveBeenCalledWith('1', {});
    expect(auditLogsService.delete).toHaveBeenCalledWith('1');
  });
});