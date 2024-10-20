import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({ secret: '1234' })],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
