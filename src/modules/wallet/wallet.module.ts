import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
import { User } from '../user/entities/user.entity';
import { HistoryModule } from '../history/history.module';
import { WalletRepository } from './repository-wallet';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, User]), HistoryModule],
  controllers: [WalletController],
  providers: [WalletService, WalletRepository],
  exports: [WalletService],
})
export class WalletModule {}
