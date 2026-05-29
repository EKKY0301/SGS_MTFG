import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    })
      .overrideGuard(JwtCookieAuthGuard)
      .useValue({ canActivate: (context: ExecutionContext) => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create on create', () => {
    const dto = { username: 'test' };
    const req = { user: { userId: '1' } } as any;
    controller.create(req, dto);
    expect(service.create).toHaveBeenCalledWith(dto, '1');
  });

  it('should call service.findAll on findAll', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalledWith({});
  });

  it('should call service.findAll on findAllByBody', () => {
    const query = { search: 'a' };
    controller.findAllByBody(query as any);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('should call service.findOne on findOneByBody', () => {
    controller.findOneByBody({ id: '1' });
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should call service.findOne on findOne', () => {
    controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should call service.search on search', () => {
    const body = { filters: {}, paginationData: {} };
    controller.search(body as any);
    expect(service.search).toHaveBeenCalledWith(body);
  });

  it('should call service.update on update', () => {
    const req = { user: { userId: '1' } } as any;
    const dto = { username: 'new' };
    controller.update(req, '1', dto as any);
    expect(service.update).toHaveBeenCalledWith('1', dto, '1');
  });

  it('should call service.delete on delete', () => {
    const req = { user: { userId: '1' } } as any;
    controller.delete(req, '1');
    expect(service.delete).toHaveBeenCalledWith('1', '1');
  });
});
