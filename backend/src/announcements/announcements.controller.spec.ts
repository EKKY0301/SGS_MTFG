import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;
  const announcementsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementsController],
      providers: [{ provide: AnnouncementsService, useValue: announcementsService }],
    }).compile();

    controller = module.get(AnnouncementsController);
    jest.clearAllMocks();
  });

  const req = { user: { userId: 'u1' } } as any;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create, search and delete methods', () => {
    controller.create(req, { title: 'A' } as any);
    controller.findAll();
    controller.findAllByBody({} as any);
    controller.findOneByBody({ id: '1' });
    controller.findOne('1');
    controller.search({} as any);
    controller.update(req, '1', {} as any);
    controller.delete(req, '1');

    expect(announcementsService.create).toHaveBeenCalledWith({ title: 'A' }, 'u1');
    expect(announcementsService.findAll).toHaveBeenCalled();
    expect(announcementsService.findOne).toHaveBeenCalledWith('1');
    expect(announcementsService.search).toHaveBeenCalledTimes(1);
    expect(announcementsService.update).toHaveBeenCalledWith('1', {}, 'u1');
    expect(announcementsService.delete).toHaveBeenCalledWith('1', 'u1');
  });
});