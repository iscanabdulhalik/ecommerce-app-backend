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
import { request } from 'http';

@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllWallets() {
    try {
      return this.walletService.findAll(request);
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
      return this.walletService.findOneById(id, request);
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
      this.logger.error('Failed to add balance', error.stack);
      throw new BadRequestException('Could not add balance');
    }
  }
}
