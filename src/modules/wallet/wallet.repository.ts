import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UserService } from '../user/user.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class WalletRepository {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private get userId(): string {
    return this.request['userId'];
  }

  private get walletId(): string {
    return this.request['user']['walletId'];
  }

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    const user = await this.userService.findOneById(createWalletDto.userId);
    if (!user) {
      console.error(`Failed to retrieve user with ID: ${createWalletDto.userId}`);
      throw new NotFoundException(`User with ID "${createWalletDto.userId}" not found`);
    }

    const wallet = this.walletRepository.create({
      balance: createWalletDto.balance,
      user: user,
    });

    return await this.walletRepository.save(wallet);
  }

  async findAllWithUserRelation() {
    return this.walletRepository.find({ relations: ['user'] });
  }

  async findByIdWithUserRelation(): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: this.walletId },
    });
    return wallet;
  }

  async findById(id: string) {
    return this.walletRepository.findOne({
      where: { id },
    });
  }

  async saveWallet(wallet: Wallet) {
    await this.walletRepository.save(wallet);
  }

  async findWalletByUserId(): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: this.userId } },
    });
    return wallet;
  }
}
