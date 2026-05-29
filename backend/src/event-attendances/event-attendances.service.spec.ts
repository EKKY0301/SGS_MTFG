import { Test, TestingModule } from '@nestjs/testing';
import { EventAttendancesService } from './event-attendances.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EventAttendancesService', () => {
  let service: EventAttendancesService;
  const prisma = {
    eventAttendance: {
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
        EventAttendancesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(EventAttendancesService);
    jest.clearAllMocks();
  });

  it('should create and find attendances', async () => {
    prisma.eventAttendance.create.mockResolvedValue({ id: 'ea1' });
    prisma.eventAttendance.count.mockResolvedValue(1);
    prisma.eventAttendance.findMany.mockResolvedValue([{ id: 'ea1' }]);

    await expect(service.create({} as any)).resolves.toEqual({ id: 'ea1' });
    await expect(service.search({ filters: {}, paginationData: {} } as any)).resolves.toMatchObject({ total: 1 });
  });

  it('should find, update and delete attendances', async () => {
    service.findOne('1');
    service.findByEventId('e1');
    service.update('1', {} as any);
    service.delete('1');

    expect(prisma.eventAttendance.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(prisma.eventAttendance.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { eventId: 'e1' } }));
    expect(prisma.eventAttendance.update).toHaveBeenCalledWith({ where: { id: '1' }, data: {} });
    expect(prisma.eventAttendance.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});