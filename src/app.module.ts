import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Wallet } from './modules/wallet/entities/wallet.entity';
import { History } from './modules/history/entities/history.entity';
import { Product } from './modules/product/entities/product.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    JwtModule.register({ secret: 'westerops' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: 5435,
      host: 'localhost',
      username: 'postgres',
      password: 'iscan',
      database: 'iscan',
      entities: [User, Wallet, Product, History],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Wallet, Product, History]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
