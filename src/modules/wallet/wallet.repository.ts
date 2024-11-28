import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class WalletRepository {
  constructor(
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

  async saveWallet(wallet: Wallet): Promise<Wallet> {
    return await this.walletRepository.save(wallet);
  }

  async findWalletByUserId(): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: this.userId } },
    });
    return wallet;
  }

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletRepository.create({
      ...createWalletDto,
      user: { id: this.userId },
    });
    return this.walletRepository.save(wallet);
  }
}
