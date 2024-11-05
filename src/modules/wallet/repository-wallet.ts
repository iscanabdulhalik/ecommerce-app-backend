import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletRepository {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async findAllWithUserRelation() {
    return this.walletRepository.find({ relations: ['user'] });
  }

  async findByIdWithUserRelation(id: string) {
    return this.walletRepository.findOneOrFail({
      where: { id },
      relations: ['user'],
    });
  }

  async findById(id: string) {
    return this.walletRepository.findOne({
      where: { id },
    });
  }

  async saveWallet(wallet: Wallet) {
    return this.walletRepository.save(wallet);
  }
}
