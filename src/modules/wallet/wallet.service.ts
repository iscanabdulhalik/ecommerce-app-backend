import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { HistoryService } from '../history/history.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly historyService: HistoryService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private get userId(): string {
    return this.request['userId'];
  }

  private get walletId(): string {
    return this.request['walletId'];
  }

  async findAll() {
    try {
      const wallets = await this.walletRepository.findAllWithUserRelation();

      await this.historyService.createLog(this.userId, 'WALLET', {
        user: this.userId,
        action: 'retrieveAll',
        details: { wallets },
        date: new Date(),
      });

      return wallets;
    } catch (error) {
      throw new BadRequestException('Could not retrieve wallets');
    }
  }

  async findOneById(id: string) {
    try {
      const wallet = await this.walletRepository.findByIdWithUserRelation(id);

      await this.historyService.createLog(this.userId, 'WALLET', {
        user: this.userId,
        action: 'retrieveById',
        details: { wallet },
        date: new Date(),
      });
      return wallet;
    } catch (error) {
      throw new BadRequestException('Error retrieving wallet');
    }
  }

  async addBalance(toBeAddedBalance: number) {
    try {
      const wallet = await this.walletRepository.findByIdWithUserRelation(this.walletId);

      const newBalance = Number(wallet.balance) + Number(toBeAddedBalance);

      if (newBalance < 0) {
        throw new BadRequestException('Insufficient balance');
      }

      wallet.balance = newBalance;

      await this.walletRepository.saveWallet(wallet);
      await this.historyService.createLog(this.userId, 'WALLET', {
        user: this.userId,
        action: 'addBalance',
        details: toBeAddedBalance,
        newBalance,
        timestamp: new Date(),
      });
      return wallet;
    } catch (error) {
      throw new BadRequestException('Error adding balance');
    }
  }
}
