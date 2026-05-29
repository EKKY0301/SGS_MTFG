import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { JwtCookieAuthGuard } from './guard/jwt-cookie-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() credentials: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      const data = await this.authService.login(credentials);

      // Manejo de token en cookie antes de enviar la respuesta
      res.cookie('token', data.token, {
        httpOnly: true, // para seguridad, no accesible desde JS
        secure: process.env.NODE_ENV === 'production', // solo en HTTPS en producción
        sameSite: 'lax', // para evitar CSRF
        maxAge: 60 * 60 * 1000, // 1 hora 60 minutos * 60 segundos * 1000 ms
      });

      return { username: data.username, role: data.role };
    } catch (err) {
      console.error('Error en login:', err);
      throw err;
    }
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('token', '', { httpOnly: true, maxAge: 0 });
    return { mensaje: 'Logout exitoso' };
  }

  @Get('me')
  @UseGuards(JwtCookieAuthGuard)
  me(@Req() req: Request) {
    return req.user;
  }
}