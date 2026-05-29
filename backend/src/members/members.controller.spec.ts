import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

describe('MembersController', () => {
  let controller: MembersController;
  const membersService = {
    create: jest.fn(),
    search: jest.fn(),
    exportSearchAsPdf: jest.fn(),
    generateYearPaymentsForResponsibleMembers: jest.fn(),
    createRelated: jest.fn(),
    addChildren: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    deseaced: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [{ provide: MembersService, useValue: membersService }],
    }).compile();

    controller = module.get(MembersController);
    jest.clearAllMocks();
  });

  const req = { user: { userId: 'u1' } } as any;

  it('should delegate controller methods to the service', async () => {
    membersService.create.mockResolvedValue({ id: 'm1' });
    membersService.search.mockResolvedValue({ items: [] });
    membersService.exportSearchAsPdf.mockResolvedValue({ buffer: Buffer.from('pdf'), fileName: 'members.pdf' });
    membersService.generateYearPaymentsForResponsibleMembers.mockResolvedValue({ year: 2026 });
    membersService.createRelated.mockResolvedValue({ id: 'm2' });
    membersService.addChildren.mockResolvedValue(undefined);
    membersService.findOne.mockResolvedValue({ id: 'm1' });
    membersService.update.mockResolvedValue({ id: 'm1', name: 'Updated' });
    membersService.deseaced.mockResolvedValue({ id: 'm1', status: 'deceased' });
    membersService.delete.mockResolvedValue({ id: 'm1' });

    await expect(controller.create(req, {} as any)).resolves.toEqual({ id: 'm1' });
    await expect(controller.search({} as any)).resolves.toEqual({ items: [] });
    await expect(controller.generateYearPayments({} as any)).resolves.toEqual({ year: 2026 });
    await expect(controller.createRelated(req, 'm1', {} as any)).resolves.toEqual({ id: 'm2' });
    await expect(controller.addChildren(req, 'm1', { children: [] } as any)).resolves.toBeUndefined();
    await expect(controller.findById('m1')).resolves.toEqual({ id: 'm1' });
    await expect(controller.update(req, 'm1', {} as any)).resolves.toEqual({ id: 'm1', name: 'Updated' });
    await expect(controller.markAsDeceased(req, 'm1', { deathDate: '2026-01-01' })).resolves.toEqual({ id: 'm1', status: 'deceased' });
    await expect(controller.delete(req, 'm1')).resolves.toEqual({ id: 'm1' });

    const res = { setHeader: jest.fn(), send: jest.fn() } as any;
    await controller.exportPdf({} as any, res);

    expect(membersService.create).toHaveBeenCalledWith({}, 'u1');
    expect(membersService.search).toHaveBeenCalledWith({});
    expect(membersService.createRelated).toHaveBeenCalledWith({}, 'm1', 'u1');
    expect(membersService.addChildren).toHaveBeenCalledWith([], 'm1', 'u1');
    expect(membersService.update).toHaveBeenCalledWith('m1', {}, 'u1');
    expect(membersService.deseaced).toHaveBeenCalledWith('m1', '2026-01-01', 'u1');
    expect(membersService.delete).toHaveBeenCalledWith('m1', 'u1');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
  });
});
