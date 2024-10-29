import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Role } from 'src/common/enums/role.enum';
import { HistoryService } from '../history/history.service';

@Injectable()
export class WalletService {
  logger: Logger = new Logger('WalletService');
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly historyService: HistoryService,
  ) {}

  async findAll(requestingUser: any) {
    try {
      const { userId } = requestingUser;
      const wallets = await this.walletRepository.find({ relations: ['user'] });

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
      const wallet = await this.walletRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }
      await this.historyService.createLog(userId, 'WALLET', {
        user: userId,
        action: 'retrieveById',
        details: { wallet },
        date: new Date(),
      });
      return wallet;
    } catch (error) {
      await this.historyService.createLog(
        requestingUser.userId,
        'WALLET_ERROR',
        {
          user: requestingUser.userId,
          action: 'retrieveByIdError',
          details: { error: error.stack },
          date: new Date(),
        },
      );
      throw new BadRequestException('Error retrieving wallet');
    }
  }

  async addBalance(requestingUser: any, toBeAddedBalance: number) {
    try {
      const { userId, role, walletId } = requestingUser;

      if (role !== Role.ADMIN) {
        throw new ForbiddenException(
          'You do not have permission to modify this wallet',
        );
      }

      const wallet: Wallet = await this.walletRepository.findOne({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }
      const currentBalance = wallet.balance;

      const newBalance = Number(currentBalance) + Number(toBeAddedBalance);

      if (newBalance < 0) {
        throw new BadRequestException('Insufficient balance');
      }

      wallet.balance = newBalance;
      await this.walletRepository.save(wallet);

      await this.historyService.createLog(userId, 'WALLET', {
        user: userId,
        action: 'addBalance',
        details: toBeAddedBalance,
        newBalance,
        timestamp: new Date(),
      });

      return wallet;
    } catch (error) {
      await this.historyService.createLog(
        requestingUser.userId,
        'WALLET_ERROR',
        {
          user: requestingUser.userId,
          action: 'addBalanceError',
          details: { error: error.stack },
          timestamp: new Date(),
        },
      );
      throw new BadRequestException('Could not add balance to wallet');
    }
  }
}
