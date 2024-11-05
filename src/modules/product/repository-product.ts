import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { History } from '../history/entities/history.entity';

@Injectable()
export class ProductRepository {
  private readonly productRepository: Repository<Product>;
  private readonly walletRepository: Repository<Wallet>;
  private readonly historyRepository: Repository<History>;

  constructor(private readonly dataSource: DataSource) {
    this.productRepository = this.dataSource.getRepository(Product);
    this.walletRepository = this.dataSource.getRepository(Wallet);
    this.historyRepository = this.dataSource.getRepository(History);
  }

  findAllProducts() {
    return this.productRepository.find();
  }

  createProduct(productData: Partial<Product>) {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async findProductById(id: string) {
    return this.productRepository.findOneOrFail({ where: { id } });
  }

  async findWalletByUserId(userId: string) {
    return this.walletRepository.findOneOrFail({
      where: { user: { id: userId } },
    });
  }

  async saveWallet(wallet: Wallet) {
    return this.walletRepository.save(wallet);
  }

  async saveProduct(product: Product) {
    return this.productRepository.save(product);
  }

  async createHistoryEntry(
    userId: string,
    productId: string,
    quantity: number,
    totalCost: number,
  ) {
    const history = this.historyRepository.create({
      product: { id: productId },
      action: 'BUY',
      details: { quantity, totalCost },
      user: { id: userId },
      date: new Date(),
    });
    return this.historyRepository.save(history);
  }
}
