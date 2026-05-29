import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('MembersService', () => {
  let service: MembersService;
  const prisma = {
    $transaction: jest.fn(),
    member: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    group: {
      findMany: jest.fn(),
    },
    paymentGroup: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    payment: {
      createMany: jest.fn(),
    },
  };
  const auditLogs = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
      ],
    }).compile();

    service = module.get(MembersService);
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback: any) => callback(prisma));
  });

  it('should create a member and log the audit entry', async () => {
    prisma.member.create.mockResolvedValueOnce({ id: 'm1' });

    const result = await service.create({ name: 'Ana' } as any, 'u1');

    expect(result).toEqual({ id: 'm1' });
    expect(auditLogs.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'u1', entity: 'Member' }));
  });

  it('should search and find members', async () => {
    prisma.group.findMany.mockResolvedValue([{ id: 'g1', name: 'Grupo' }]);
    prisma.member.findMany.mockResolvedValue([{ id: 'm1', groupId: 'g1', name: 'Ana', surname: 'Lopez', memberNumber: 1 }]);
    prisma.member.count.mockResolvedValue(1);
    prisma.member.findUnique.mockResolvedValue({ id: 'm1', biologicalFather: { id: 'f1' }, biologicalMother: { id: 'm2' } });

    const searched = await service.search({ paginationData: {}, filters: {} } as any);
    const member = await service.findOne('m1');

    expect(searched.items).toHaveLength(1);
    expect(member).toMatchObject({ id: 'm1', father: { id: 'f1' }, mother: { id: 'm2' } });
  });

  it('should update, mark deceased and delete members', async () => {
    prisma.member.findUnique.mockResolvedValueOnce({ id: 'm1', status: 'active' });
    prisma.member.update.mockResolvedValueOnce({ id: 'm1', name: 'Updated' });
    prisma.member.findUnique.mockResolvedValueOnce({ id: 'm1', status: 'active', deathDate: null });
    prisma.member.update.mockResolvedValueOnce({ id: 'm1', status: 'deceased' });
    prisma.member.findUnique.mockResolvedValueOnce({ id: 'm1' });
    prisma.member.delete.mockResolvedValueOnce({ id: 'm1' });

    await expect(service.update('m1', { name: 'Updated' } as any, 'u1')).resolves.toEqual({ id: 'm1', name: 'Updated' });
    await expect(service.deseaced('m1', '2026-01-01', 'u1')).resolves.toEqual({ id: 'm1', status: 'deceased' });
    await expect(service.delete('m1', 'u1')).resolves.toEqual({ id: 'm1' });

    expect(auditLogs.create).toHaveBeenCalled();
  });

  it('should handle related members and payment generation', async () => {
    prisma.member.findUnique.mockResolvedValueOnce({ id: 'p1' });
    prisma.member.create.mockResolvedValueOnce({ id: 'p2' });
    prisma.member.update.mockResolvedValueOnce({ id: 'p1', partnerId: 'p2' });
    prisma.member.findUnique.mockResolvedValueOnce({ id: 'p1', partnerId: 'p2' });
    prisma.member.findMany.mockResolvedValue([]);

    await expect(service.createRelated({ relation: 'partner' } as any, 'p1', 'u1')).resolves.toEqual({ id: 'p1', partnerId: 'p2' });
    await expect(service.generateYearPaymentsForResponsibleMembers({ year: 2026, amount: 10 } as any)).resolves.toMatchObject({ membersProcessed: 0 });
  });
});
