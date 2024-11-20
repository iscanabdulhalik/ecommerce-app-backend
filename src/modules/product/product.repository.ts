import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { REQUEST } from '@nestjs/core';
import { WalletService } from '../wallet/wallet.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductRepository {
  @Inject(forwardRef(() => WalletService))
  private readonly walletService: WalletService;
  @InjectRepository(Product)
  private readonly productRepository: Repository<Product>;
  @Inject(REQUEST) private readonly request: Request;

  private get productId(): string {
    return this.request['productId'];
  }

  private get userId(): string {
    return this.request['userId'];
  }

  findAllProducts() {
    return this.productRepository.find();
  }

  async buyProduct(id: string, quantity: number): Promise<Product> {
    try {
      const product = await this.findProductById(id);
      if (!product) {
        throw new BadRequestException('Product not found');
      }
      const wallet = await this.walletService.findWalletByUserId();
      if (!wallet) {
        throw new BadRequestException('Wallet not found for this user.');
      }
      const totalCost = product.price * quantity;

      if (wallet.balance < totalCost) {
        throw new BadRequestException('Insufficient balance');
      }

      if (product.stock < quantity) {
        throw new BadRequestException('Not enough stock available');
      }

      wallet.balance -= totalCost;
      product.stock -= quantity;

      await this.walletService.saveWallet(wallet);
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      console.error('Error:', error);
      throw new BadRequestException('Could not process purchase');
    }
  }

  async findProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id: id } });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  async saveProduct(product: Product) {
    return this.productRepository.save(product);
  }
}
