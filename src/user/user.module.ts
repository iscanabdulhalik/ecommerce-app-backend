import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // JWT stratejisini kaydet
    JwtModule.register({
      secret: 'westerops', // Aynı secret key
      signOptions: { expiresIn: '1h' }, // Token süresi
    }),
    TypeOrmModule.forFeature([User]), // User entity'si burada typeorm modülüne ekleniyor
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService, JwtModule, PassportModule], // Eğer başka modüllerde kullanacaksan UserService'i export et
})
export class UserModule {}
