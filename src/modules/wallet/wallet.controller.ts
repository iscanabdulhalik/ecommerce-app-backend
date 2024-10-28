import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Req,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Request } from 'express';
import { BalanceDto } from './dto/balance-wallet.dto';

@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllWallets() {
    try {
      this.logger.log('Retrieving all wallets');
      const wallets = await this.walletService.findAll();
      this.logger.log(`Successfully retrieved ${wallets.length} wallets`);
      return wallets;
    } catch (error) {
      this.logger.error('Failed to retrieve wallets', error.stack);
      throw new BadRequestException('Could not retrieve wallets');
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getWalletById(@Param('id') id: string) {
    try {
      this.logger.log(`Retrieving wallet with ID: ${id}`);
      const wallet = await this.walletService.findOneById(id);
      this.logger.log(`Successfully retrieved wallet with ID: ${id}`);
      return wallet;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve wallet with ID: ${id}`,
        error.stack,
      );
      throw new BadRequestException('Could not retrieve wallet');
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addBalance(@Req() req: Request, @Body() balanceDto: BalanceDto) {
    try {
      return this.walletService.addBalance(req.user, balanceDto.balance);
    } catch (error) {
      throw new BadRequestException('Could not add balance');
    }
  }
}
