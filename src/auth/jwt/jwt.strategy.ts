import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'westerops', // Aynı secret key burada kullanılıyor
    });
  }

  // Token doğrulandıktan sonra payload'ı çözümleyerek kullanıcı bilgilerine erişiriz
  async validate(payload: any) {
    // JWT payload içeriği: { sub: userId, email: userEmail, role: userRole }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
