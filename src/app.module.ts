import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Wallet } from './wallet/entities/wallet.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: 'iscan',
      host: 'localhost',
      port: 5435,
      username: "postgres",
      password: "iscan",
      entities: [
        User,
        Wallet
      ],
      synchronize: true, //make it false in production mode

    }),
    TypeOrmModule.forFeature([User, Wallet]),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
