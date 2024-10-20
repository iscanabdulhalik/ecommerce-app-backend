import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // User entity'si burada typeorm modülüne ekleniyor
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Eğer başka modüllerde kullanacaksan UserService'i export et
})
export class UserModule {}
