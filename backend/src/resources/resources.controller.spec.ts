import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

describe('ResourcesController', () => {
  let controller: ResourcesController;
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [{ provide: ResourcesService, useValue: service }],
    }).compile();

    controller = module.get(ResourcesController);
    jest.clearAllMocks();
  });

  const req = { user: { userId: 'u1' } } as any;

  it('should delegate controller methods to the service', () => {
    controller.create(req, {} as any);
    controller.findAll();
    controller.findAllByBody({} as any);
    controller.findOneByBody({ id: '1' });
    controller.findOne('1');
    controller.search({} as any);
    controller.update(req, '1', {} as any);
    controller.delete(req, '1');

    expect(service.create).toHaveBeenCalledWith({}, 'u1');
    expect(service.findAll).toHaveBeenCalled();
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(service.search).toHaveBeenCalledTimes(1);
    expect(service.update).toHaveBeenCalledWith('1', {}, 'u1');
    expect(service.delete).toHaveBeenCalledWith('1', 'u1');
  });
});