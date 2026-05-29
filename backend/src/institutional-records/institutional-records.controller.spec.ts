import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionalRecordsController } from './institutional-records.controller';
import { InstitutionalRecordsService } from './institutional-records.service';

describe('InstitutionalRecordsController', () => {
  let controller: InstitutionalRecordsController;
  const service = {
    create: jest.fn(),
    createWithPdf: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getDownloadInfo: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitutionalRecordsController],
      providers: [{ provide: InstitutionalRecordsService, useValue: service }],
    }).compile();

    controller = module.get(InstitutionalRecordsController);
    jest.clearAllMocks();
  });

  const req = { user: { userId: 'u1' } } as any;

  it('should delegate controller methods to the service', async () => {
    service.create.mockResolvedValue({ id: 'i1' });
    service.createWithPdf.mockResolvedValue({ id: 'i2' });
    service.findAll.mockResolvedValue([{ id: 'i1' }]);
    service.findOne.mockResolvedValue({ id: 'i1' });
    service.getDownloadInfo.mockResolvedValue({ absolutePath: 'a.pdf', fileName: 'a.pdf' });
    service.search.mockResolvedValue({ items: [] });
    service.update.mockResolvedValue({ id: 'i1', title: 'Updated' });
    service.remove.mockResolvedValue({ id: 'i1' });

    await expect(controller.create(req, {} as any)).resolves.toEqual({ id: 'i1' });
    await expect(controller.uploadPdf(req, {} as any, { originalname: 'doc.pdf' } as any)).resolves.toEqual({ id: 'i2' });
    await expect(controller.findAll()).resolves.toEqual([{ id: 'i1' }]);
    await expect(controller.findOne('i1')).resolves.toEqual({ id: 'i1' });
    const res = { download: jest.fn() } as any;
    await controller.downloadFile('i1', res);
    await expect(controller.search({} as any)).resolves.toEqual({ items: [] });
    await expect(controller.update(req, 'i1', {} as any)).resolves.toEqual({ id: 'i1', title: 'Updated' });
    await expect(controller.remove(req, 'i1')).resolves.toEqual({ id: 'i1' });

    expect(service.create).toHaveBeenCalledWith({}, 'u1');
    expect(service.createWithPdf).toHaveBeenCalledWith({}, { originalname: 'doc.pdf' }, 'u1');
    expect(service.getDownloadInfo).toHaveBeenCalledWith('i1');
    expect(res.download).toHaveBeenCalledWith('a.pdf', 'a.pdf');
  });
});