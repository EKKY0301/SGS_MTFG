import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Ignora el extractor por defecto, personaliza para leer de cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.token,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secreto_dev',
    });
  }

  async validate(payload: any) {
    // Puedes añadir lógica para validar roles, etc.
    return { userId: payload.sub, username: payload.username };
  }
}