import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Extiende el guard Passport JWT pero sobrescribe la lógica para extraer el token desde la cookie
export class JwtCookieAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    // Lee el token sólo desde la cookie, nunca del header
    if (!req.cookies || !req.cookies.token) {
      throw new UnauthorizedException('No hay JWT en cookie');
    }
    // Passport usará este req para validar el JWT
    return req;
  }
}