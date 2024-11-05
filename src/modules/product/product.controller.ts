import { Controller, Get, Post, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { BuyProductDto } from './dto/buy-product.dto';
import { Product } from './entities/product.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';

@UseGuards(JwtAuthGuard, AuthGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.productService.findAll();
    } catch (error) {
      throw new BadRequestException('Could not retrieve products');
    }
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    try {
      return await this.productService.createProduct(createProductDto);
    } catch (error) {
      throw new BadRequestException('Could not create product');
    }
  }

  @Post('/buy/:productId')
  @UseGuards(JwtAuthGuard)
  async buyProduct(@Param('productId') productId: string, @Body() buyProductDto: BuyProductDto) {
    try {
      return await this.productService.buyProduct(productId, buyProductDto.quantity);
    } catch (error) {
      throw new BadRequestException('Could not complete the purchase');
    }
  }
}
