import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { HistoryService } from '../history/history.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async buyProduct(user: any, productId: string, quantity: number) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    const { userId } = user;
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    const totalCost = product.price * quantity;
    if (wallet.balance < totalCost) {
      throw new BadRequestException('Insufficient balance');
    }

    wallet.balance -= totalCost;
    product.stock -= quantity;

    function createHistory() {
      const history = this.historyRepository.create({
        user: { id: user.userId },
        product: { id: productId },
        quantity,
        totalCost,
      });
      return this.historyRepository.save(history);
    }
    createHistory();

    await this.walletRepository.save(wallet);
    await this.productRepository.save(product);

    return { message: 'Purchase successful', product, wallet };
  }
}
