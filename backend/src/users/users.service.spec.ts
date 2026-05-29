import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockAuditLogs = {
  create: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogsService, useValue: mockAuditLogs },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user and log audit', async () => {
    mockPrisma.user.create.mockResolvedValue({ id: '1', username: 'test' });
    await service.create({ username: 'test' } as any, 'admin');
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(mockAuditLogs.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'admin', action: 'create' })
    );
  });

  it('should find all users (delegates to search)', () => {
    const spy = jest.spyOn(service, 'search').mockResolvedValue({} as any);
    service.findAll({} as any);
    expect(spy).toHaveBeenCalled();
  });

  it('should search users', async () => {
    mockPrisma.user.count.mockResolvedValue(1);
    mockPrisma.user.findMany.mockResolvedValue([{ id: '1' }]);
    const result = await service.search({ filters: {}, paginationData: {} } as any);
    expect(result.data).toBeDefined();
    expect(result.total).toBe(1);
  });

  it('should find one user', () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: '1' });
    service.findOne('1');
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should update a user and log audit', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: '1', username: 'old' });
    mockPrisma.user.update.mockResolvedValue({ id: '1', username: 'new' });
    await service.update('1', { username: 'new' } as any, 'admin');
    expect(mockPrisma.user.update).toHaveBeenCalled();
    expect(mockAuditLogs.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'admin', action: 'update' })
    );
  });

  it('should delete a user and log audit', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: '1', username: 'old' });
    mockPrisma.user.delete.mockResolvedValue({ id: '1', username: 'old' });
    await service.delete('1', 'admin');
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(mockAuditLogs.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'admin', action: 'delete' })
    );
  });
});
