import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { HistoryModule } from '../history/history.module';
import { ProductRepository } from './product.repository';
import { AuthModule } from 'src/auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Wallet]),
    forwardRef(() => UserModule),
    forwardRef(() => WalletModule),
    forwardRef(() => HistoryModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
