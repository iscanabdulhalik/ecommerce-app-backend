import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductRepository {
  @InjectRepository(Product)
  private readonly productRepository: Repository<Product>;

  findAllProducts() {
    return this.productRepository.find();
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
