import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

export type AuthLoginResponse = {
  username: string;
  role: string | null;
  token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  
  async login(credentials: LoginDto): Promise<AuthLoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username: credentials.username },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const isPasswordValid = await compare(
      credentials.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const payload = { sub: user.id, username: user.username };

    return { 
      username: user.username,
      role: user.role?.name ?? null,
      token: this.jwtService.sign(payload),
     };
  }
}