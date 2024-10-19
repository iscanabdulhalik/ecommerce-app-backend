import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Wallet } from './wallet/entities/wallet.entity';
import { History } from './history/entities/history.entity';
import { Product } from './product/entities/product.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
