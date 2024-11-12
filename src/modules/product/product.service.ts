import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { REQUEST } from '@nestjs/core';
import { HistoryService } from '../history/history.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly historyService: HistoryService,
    private readonly productRepository: ProductRepository,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private get userId(): string {
    return this.request['userId'];
  }

  async findAll() {
    await this.historyService.createLog(this.userId, 'PRODUCT', {
      user: this.userId,
      action: 'retrieveAll',
      details: { date: new Date() },
    });
    return await this.productRepository.findAllProducts();
  }

  async createProduct(createProductDto: CreateProductDto) {
    return await this.productRepository.createProduct(createProductDto);
  }

  async buyProduct(productId: string, quantity: number) {
    try {
      const product = await this.productRepository.findProductById(productId);
      if (product.stock < quantity) {
        throw new BadRequestException('Not enough stock available');
      }

      const wallet = await this.productRepository.findWalletByUserId(this.userId);
      const totalCost = product.price * quantity;
      if (wallet.balance < totalCost) {
        throw new BadRequestException('Insufficient balance');
      }

      wallet.balance -= totalCost;
      product.stock -= quantity;

      await this.historyService.createLog(this.userId, 'PRODUCT', {
        user: this.userId,
        action: 'BUY',
        details: { quantity, totalCost },
        date: new Date(),
      });
      await this.productRepository.saveWallet(wallet);
      await this.productRepository.saveProduct(product);

      return { message: 'Purchase successful', product, wallet };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
