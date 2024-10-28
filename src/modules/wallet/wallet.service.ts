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
import { JwtPayload } from 'src/common/types/jwtPayload';

@Injectable()
export class WalletService {
  logger: Logger = new Logger('WalletService');
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly historyService: HistoryService,
  ) {}

  async findAll() {
    try {
      this.logger.log('Retrieving all wallets');

      const wallets = await this.walletRepository.find({ relations: ['user'] });

      this.logger.log(`Successfully retrieved ${wallets.length} wallets`);
      await this.historyService.createLog(null, 'WALLET', {
        actionType: 'retrieveAll',
        timestamp: new Date(),
      });

      return wallets;
    } catch (error) {
      this.logger.error('Error retrieving wallets', error.stack);
      throw new BadRequestException('Could not retrieve wallets');
    }
  }

  async findOneById(id: string) {
    try {
      const wallet = await this.walletRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }
      return wallet;
    } catch (error) {
      throw new BadRequestException('Error retrieving wallet');
    }
  }

  async addBalance(requestingUser: any, toBeAddedBalance: number) {
    try {
      const { userId, email, role, walletId } = requestingUser;
      this.logger.log(
        `Attempting to add balance for email: ${email} userId: ${userId}, balance: ${toBeAddedBalance}, role: ${role}`,
      );

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

      this.logger.log(
        `Current balance: ${currentBalance}, New balance: ${newBalance}`,
      );
      if (newBalance < 0) {
        throw new BadRequestException('Insufficient balance');
      }

      wallet.balance = newBalance;
      await this.walletRepository.save(wallet);

      this.logger.log(`New balance saved for userId: ${userId}`);

      return wallet;
    } catch (error) {
      this.logger.error(error.stack);
      throw new BadRequestException('Could not add balance to wallet');
    }
  }
}
