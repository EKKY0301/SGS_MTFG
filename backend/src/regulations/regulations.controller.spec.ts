import { Test, TestingModule } from '@nestjs/testing';
import { RegulationsController } from './regulations.controller';
import { RegulationsService } from './regulations.service';

describe('RegulationsController', () => {
  let controller: RegulationsController;
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
      controllers: [RegulationsController],
      providers: [{ provide: RegulationsService, useValue: service }],
    }).compile();

    controller = module.get(RegulationsController);
    jest.clearAllMocks();
  });

  const req = { user: { userId: 'u1' } } as any;

  it('should delegate controller methods to the service', async () => {
    service.create.mockResolvedValue({ id: 'r1' });
    service.createWithPdf.mockResolvedValue({ id: 'r2' });
    service.findAll.mockResolvedValue([{ id: 'r1' }]);
    service.findOne.mockResolvedValue({ id: 'r1' });
    service.getDownloadInfo.mockResolvedValue({ absolutePath: 'a.pdf', fileName: 'a.pdf' });
    service.search.mockResolvedValue({ items: [] });
    service.update.mockResolvedValue({ id: 'r1', title: 'Updated' });
    service.remove.mockResolvedValue({ id: 'r1' });

    await expect(controller.create(req, {} as any)).resolves.toEqual({ id: 'r1' });
    await expect(controller.uploadPdf(req, {} as any, { originalname: 'doc.pdf' } as any)).resolves.toEqual({ id: 'r2' });
    await expect(controller.findAll()).resolves.toEqual([{ id: 'r1' }]);
    await expect(controller.findOne('r1')).resolves.toEqual({ id: 'r1' });
    const res = { download: jest.fn() } as any;
    await controller.downloadFile('r1', res);
    await expect(controller.search({} as any)).resolves.toEqual({ items: [] });
    await expect(controller.update(req, 'r1', {} as any)).resolves.toEqual({ id: 'r1', title: 'Updated' });
    await expect(controller.remove(req, 'r1')).resolves.toEqual({ id: 'r1' });

    expect(service.create).toHaveBeenCalledWith({}, 'u1');
    expect(service.createWithPdf).toHaveBeenCalledWith({}, { originalname: 'doc.pdf' }, 'u1');
    expect(service.getDownloadInfo).toHaveBeenCalledWith('r1');
    expect(res.download).toHaveBeenCalledWith('a.pdf', 'a.pdf');
  });
});