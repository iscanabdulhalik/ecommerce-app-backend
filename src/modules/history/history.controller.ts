import { Controller, Get, Post, Body, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { QueryHistoryDto } from './dto/query-history.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  async createHistory(@Body() createHistoryDto: CreateHistoryDto) {
    try {
      const { action, details } = createHistoryDto;

      return await this.historyService.createLog(action, details);
    } catch (error) {
      throw new BadRequestException('Could not create history log');
    }
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getHistory(@Query() queryHistoryDto: QueryHistoryDto) {
    try {
      const { userId } = queryHistoryDto;
      if (userId) {
        return await this.historyService.findByUserId(userId);
      }
      return await this.historyService.findAll();
    } catch (error) {
      throw new BadRequestException('Could not retrieve history logs');
    }
  }
}
