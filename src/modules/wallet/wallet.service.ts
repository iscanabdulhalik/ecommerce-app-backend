import { Injectable, BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { HistoryService } from '../history/history.service';
import { REQUEST } from '@nestjs/core';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly historyService: HistoryService,
    private readonly userService: UserService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private get userId(): string {
    return this.request['userId'];
  }

  async findAll() {
    try {
      const wallets = await this.walletRepository.findAllWithUserRelation();

      await this.historyService.createLog('WALLET', {
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
      const wallet = await this.walletRepository.findById(id);

      await this.historyService.createLog('WALLET', {
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
      const wallet = await this.walletRepository.findByIdWithUserRelation();
      const user = await this.userService.findOneById(this.userId);

      const newBalance = Number(wallet.balance) + Number(toBeAddedBalance);

      if (newBalance < 0) {
        throw new BadRequestException('Insufficient balance');
      }

      wallet.balance = newBalance;

      await this.walletRepository.saveWallet(wallet);
      await this.historyService.createLog('WALLET', {
        action: 'addBalance',
        details: `user: ${user.name} added ${toBeAddedBalance} to wallet`,
        newBalance,
        timestamp: new Date(),
      });
      return wallet;
    } catch (error) {
      throw new BadRequestException('Error adding balance');
    }
  }

  async saveWallet(wallet: Wallet) {
    await this.walletRepository.saveWallet(wallet);
  }

  async findWalletByUserId(): Promise<Wallet> {
    return await this.walletRepository.findWalletByUserId();
  }

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    try {
      const user = await this.userService.findOneById(createWalletDto.userId);
      if (!user) {
        console.error(`Failed to retrieve user with ID: ${createWalletDto.userId}`);
        throw new NotFoundException(`User with ID "${createWalletDto.userId}" not found`);
      }

      const wallet = this.walletRepository.createWallet(createWalletDto);

      const savedWallet = await this.walletRepository.saveWallet(await wallet);
      return savedWallet;
    } catch (error) {
      console.error('Error:', error);
      throw new BadRequestException('Could not create wallet');
    }
  }
}
