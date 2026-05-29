import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  const mockRes = () => ({ cookie: jest.fn() });

  beforeEach(async () => {
    authService = { login: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return username after successful login', async () => {
      authService.login.mockResolvedValue({ username: 'admin', token: 'token-fake' });
      const res = mockRes();

      await expect(
        controller.login({ username: 'admin', password: '1234' }, res as any),
      ).resolves.toEqual({ username: 'admin' });

      expect(authService.login).toHaveBeenCalledWith({ username: 'admin', password: '1234' });
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should set an httpOnly cookie with the returned token', async () => {
      authService.login.mockResolvedValue({ username: 'admin', token: 'token-fake' });
      const res = mockRes();

      await controller.login({ username: 'admin', password: '1234' }, res as any);

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'token-fake',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('should set sameSite lax cookie to prevent CSRF', async () => {
      authService.login.mockResolvedValue({ username: 'admin', token: 'token-fake' });
      const res = mockRes();

      await controller.login({ username: 'admin', password: '1234' }, res as any);

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'token-fake',
        expect.objectContaining({ sameSite: 'lax' }),
      );
    });

    it('should propagate errors thrown by AuthService', async () => {
      authService.login.mockRejectedValue(new Error('Credenciales invalidas'));
      const res = mockRes();

      await expect(
        controller.login({ username: 'bad', password: 'bad' }, res as any),
      ).rejects.toThrow('Credenciales invalidas');
    });

    it('should not set cookie if AuthService throws', async () => {
      authService.login.mockRejectedValue(new Error('Fail'));
      const res = mockRes();

      await controller.login({ username: 'bad', password: 'bad' }, res as any).catch(() => null);

      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear the token cookie and return success message', () => {
      const res = mockRes();

      const result = controller.logout(res as any);

      expect(res.cookie).toHaveBeenCalledWith('token', '', { httpOnly: true, maxAge: 0 });
      expect(result).toEqual({ mensaje: 'Logout exitoso' });
    });
  });
});