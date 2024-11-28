import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { REQUEST } from '@nestjs/core';
import { HistoryService } from '../history/history.service';
import { Product } from './entities/product.entity';
import { DataSource } from 'typeorm';
import { WalletService } from '../wallet/wallet.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly historyService: HistoryService,
    private readonly productRepository: ProductRepository,
    private readonly dataSource: DataSource,
    private readonly walletService: WalletService,
    private readonly userService: UserService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private get userId(): string {
    return this.request['userId'];
  }

  async findAll() {
    await this.historyService.createLog('PRODUCT', {
      action: 'retrieveAll',
      details: { date: new Date() },
    });
    return await this.productRepository.findAllProducts();
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        const product = manager.getRepository(Product).create(createProductDto);
        const savedProduct = await manager.getRepository(Product).save(product);
        const user = await this.userService.findOneById(this.userId);
        await this.historyService.createLog('PRODUCT', {
          action: 'create',
          details: `${user.name} created a new product: ${savedProduct.name}`,
          date: new Date(),
        });
        return savedProduct;
      } catch (error) {
        throw new BadRequestException('Could not create product');
      }
    });
  }

  async buyProduct(id: string, quantity: number) {
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
      await this.productRepository.saveProduct(product);

      return product;
    } catch (error) {
      console.error('Error:', error);
      throw new BadRequestException('Could not process purchase');
    }
  }

  async findProductById(id: string) {
    return await this.productRepository.findProductById(id);
  }
}
