import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './entities/history.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createLog(
    userId: string,
    action: string,
    details: Record<string, any>,
  ): Promise<History> {
    const user = await this.userRepository.findOne({ where: { id: userId } }); // User'ı alıyoruz
    if (!user) {
      throw new Error('User not found');
    }

    const log = this.historyRepository.create({
      user,
      action,
      details,
      date: details.timestamp || new Date(),
    });
    return await this.historyRepository.save(log);
  }

  async findByUserId(userId: string): Promise<History[]> {
    return await this.historyRepository.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
    });
  }

  async findAll(): Promise<History[]> {
    return await this.historyRepository.find({
      relations: ['user'],
      order: { date: 'DESC' },
    });
  }
}
