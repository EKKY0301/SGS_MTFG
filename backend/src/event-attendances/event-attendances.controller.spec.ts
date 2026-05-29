import { Test, TestingModule } from '@nestjs/testing';
import { EventAttendancesController } from './event-attendances.controller';
import { EventAttendancesService } from './event-attendances.service';

describe('EventAttendancesController', () => {
  let controller: EventAttendancesController;
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEventId: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventAttendancesController],
      providers: [{ provide: EventAttendancesService, useValue: service }],
    }).compile();

    controller = module.get(EventAttendancesController);
    jest.clearAllMocks();
  });

  it('should delegate methods to the service', () => {
    controller.create({} as any, {} as any);
    controller.findAllByBody({} as any);
    controller.findOneByBody({ id: '1' });
    controller.findOne('1');
    controller.search({} as any);
    controller.update('1', {} as any);
    controller.delete('1');

    expect(service.create).toHaveBeenCalledWith({});
    expect(service.findAll).toHaveBeenCalled();
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(service.findByEventId).toHaveBeenCalledWith('1');
    expect(service.search).toHaveBeenCalledTimes(1);
    expect(service.update).toHaveBeenCalledWith('1', {});
    expect(service.delete).toHaveBeenCalledWith('1');
  });
});