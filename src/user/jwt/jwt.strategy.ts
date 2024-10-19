import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Token'ı Bearer olarak al
      ignoreExpiration: false, // Token süresinin geçip geçmediğini kontrol et
      secretOrKey: 'westerops', // Aynı secret key
    });
  }

  // Token'dan gelen bilgileri doğrula ve request.user içine yerleştir
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
