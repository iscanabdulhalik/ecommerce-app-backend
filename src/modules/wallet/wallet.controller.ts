import {
  Controller,
  Get,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  Put,
  Post,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { BalanceDto } from './dto/balance-wallet.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Wallet } from './entities/wallet.entity';

@UseGuards(JwtAuthGuard, AuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAllWallets() {
    try {
      return this.walletService.findAll();
    } catch (error) {
      throw new BadRequestException('Could not retrieve wallets');
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getWalletById(@Param('id') id: string) {
    try {
      return this.walletService.findOneById(id);
    } catch (error) {
      throw new BadRequestException('Could not retrieve wallet');
    }
  }

  @Put()
  async addBalance(@Body() balanceDto: BalanceDto) {
    try {
      return this.walletService.addBalance(balanceDto.balance);
    } catch (error) {
      throw new BadRequestException('Could not add balance');
    }
  }
}
