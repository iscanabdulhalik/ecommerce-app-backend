import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Wallet } from './wallet/entities/wallet.entity';
import { History } from './history/entities/history.entity';
import { Product } from './product/entities/product.entity';
import { JwtModule } from '@nestjs/jwt';



@Module({
  imports: [
    JwtModule.register({ secret: '1234' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: 'iscan',
      host: 'localhost',
      port: 5435,
      username: "postgres",
      password: "iscan",
      entities: [
        User,
        Wallet,
        Product,
        History,
      ],
      synchronize: true, //make it false in production mode

    }),
    TypeOrmModule.forFeature([User, Wallet, Product, History]),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
