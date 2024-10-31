import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { WalletRepository } from './repository-wallet';
import { HistoryService } from '../history/history.service';

@Injectable()
export class WalletService {
  logger: Logger = new Logger('WalletService');

  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly historyService: HistoryService,
  ) {}

  async findAll(requestingUser: any) {
    try {
      const { userId } = requestingUser;
      const wallets = await this.walletRepository.findAllWithUserRelation();

      await this.historyService.createLog(userId, 'WALLET', {
        user: userId,
        action: 'retrieveAll',
        details: { wallets },
        date: new Date(),
      });

      return wallets;
    } catch (error) {
      await this.historyService.createLog(
        requestingUser.userId,
        'WALLET_ERROR',
        {
          user: requestingUser.userId,
          action: 'retrieveAllError',
          details: { error: error.stack },
          date: new Date(),
        },
      );
      throw new BadRequestException('Could not retrieve wallets');
    }
  }

  async findOneById(id: string, requestingUser: any) {
    try {
      const { userId } = requestingUser;
      const wallet = await this.walletRepository.findByIdWithUserRelation(id);

      await this.historyService.createLog(userId, 'WALLET', {
        user: userId,
        action: 'retrieveById',
        details: { wallet },
        date: new Date(),
      });
      return wallet;
    } catch (error) {
      throw new BadRequestException('Error retrieving wallet');
    }
  }

  async addBalance(requestingUser: any, toBeAddedBalance: number) {
    try {
      const { userId, walletId } = requestingUser;

      const wallet = await this.walletRepository.findById(walletId);

      const newBalance = Number(wallet.balance) + Number(toBeAddedBalance);

      if (newBalance < 0) {
        throw new BadRequestException('Insufficient balance');
      }

      wallet.balance = newBalance;
      await this.walletRepository.saveWallet(wallet);

      await this.historyService.createLog(userId, 'WALLET', {
        user: userId,
        action: 'addBalance',
        details: toBeAddedBalance,
        newBalance,
        timestamp: new Date(),
      });

      return wallet;
    } catch (error) {
      throw new BadRequestException('Could not add balance to wallet');
    }
  }
}
