import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { QueryHistoryDto } from './dto/query-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Controller('history')
export class HistoryController {
  constructor(
    private readonly historyService: HistoryService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async createHistory(@Body() createHistoryDto: CreateHistoryDto) {
    try {
      const { userId, action, details } = createHistoryDto;

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      return await this.historyService.createLog(user, action, details);
    } catch (error) {
      throw new BadRequestException('Could not create history log');
    }
  }

  @Get()
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
