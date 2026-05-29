import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashSync } from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return username and token on successful login', async () => {
    const passwordHash = hashSync('1234', 10);

    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      username: 'admin',
      passwordHash,
      isActive: true,
    });

    const result = await service.login({ username: 'admin', password: '1234' });

    expect(result).toEqual({ username: 'admin', role: null, token: 'mocked-jwt-token' });
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'u1', username: 'admin' });
  });

  it('should throw UnauthorizedException if user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ username: 'no-user', password: '1234' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user is inactive', async () => {
    const passwordHash = hashSync('1234', 10);

    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      username: 'admin',
      passwordHash,
      isActive: false,
    });

    await expect(
      service.login({ username: 'admin', password: '1234' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    const passwordHash = hashSync('1234', 10);

    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      username: 'admin',
      passwordHash,
      isActive: true,
    });

    await expect(
      service.login({ username: 'admin', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should not call jwtService.sign if credentials are invalid', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await service.login({ username: 'ghost', password: 'x' }).catch(() => null);

    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});