import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Request } from 'express';
import { CreateProductDto } from './dto/create-product.dto';
import { BuyProductDto } from './dto/buy-product.dto';
import { Product } from './entities/product.entity';

@Controller('product')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.productService.findAll();
    } catch (error) {
      this.logger.error('Failed to retrieve products', error.stack);
      throw new BadRequestException('Could not retrieve products');
    }
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    try {
      return await this.productService.createProduct(createProductDto);
    } catch (error) {
      this.logger.error('Failed to create product', error.stack);
      throw new BadRequestException('Could not create product');
    }
  }

  @Post('/buy/:productId')
  @UseGuards(JwtAuthGuard)
  async buyProduct(
    @Req() req: Request,
    @Param('productId') productId: string,
    @Body() buyProductDto: BuyProductDto,
  ) {
    try {
      const user = req.user;
      return await this.productService.buyProduct(
        user,
        productId,
        buyProductDto.quantity,
      );
    } catch (error) {
      this.logger.error(
        `Failed to buy product with ID: ${productId}`,
        error.stack,
      );
      throw new BadRequestException('Could not complete the purchase');
    }
  }
}
