import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;
  const eventsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    search: jest.fn(),
    findOne: jest.fn(),
    exportSearchAsPdf: jest.fn(),
    exportEventDetailAsPdf: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: eventsService }],
    }).compile();

    controller = module.get(EventsController);
    jest.clearAllMocks();
  });

  const req = { user: { userId: 'u1' } } as any;

  it('should delegate event CRUD methods', async () => {
    eventsService.create.mockResolvedValue({ id: 'e1' });
    eventsService.findAll.mockResolvedValue([{ id: 'e1' }]);
    eventsService.search.mockResolvedValue({ items: [] });
    eventsService.findOne.mockResolvedValue({ id: 'e1' });
    eventsService.update.mockResolvedValue({ id: 'e1', name: 'Updated' });
    eventsService.delete.mockResolvedValue({ id: 'e1' });

    await expect(controller.create(req, {} as any)).resolves.toEqual({ id: 'e1' });
    await expect(controller.findAll()).resolves.toEqual([{ id: 'e1' }]);
    await expect(controller.findAllByBody({} as any)).resolves.toEqual({ items: [] });
    await expect(controller.findOneByBody({ id: 'e1' })).resolves.toEqual({ id: 'e1' });
    await expect(controller.findOne('e1')).resolves.toEqual({ id: 'e1' });
    await expect(controller.search({} as any)).resolves.toEqual({ items: [] });
    await expect(controller.update(req, 'e1', {} as any)).resolves.toEqual({ id: 'e1', name: 'Updated' });
    await expect(controller.delete(req, 'e1')).resolves.toEqual({ id: 'e1' });

    expect(eventsService.create).toHaveBeenCalledWith({}, 'u1');
    expect(eventsService.update).toHaveBeenCalledWith('e1', {}, 'u1');
    expect(eventsService.delete).toHaveBeenCalledWith('e1', 'u1');
  });

  it('should write PDF download responses', async () => {
    const res = { setHeader: jest.fn(), send: jest.fn() } as any;
    eventsService.exportSearchAsPdf.mockResolvedValue({ buffer: Buffer.from('pdf'), fileName: 'events.pdf' });
    eventsService.exportEventDetailAsPdf.mockResolvedValue({ buffer: Buffer.from('pdf2'), fileName: 'event.pdf' });

    await controller.exportPdf({} as any, res);
    await controller.exportEventDetailPdf('e1', res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.send).toHaveBeenCalled();
  });
});