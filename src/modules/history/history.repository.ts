import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { History } from './entities/history.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class HistoryRepository {
  private readonly historyRepository: Repository<History>;

  constructor(private readonly dataSource: DataSource) {
    this.historyRepository = this.dataSource.getRepository(History);
  }

  async createHistoryLog(
    user: User,
    action: string,
    details: Record<string, any>,
  ): Promise<History> {
    const log = this.historyRepository.create({
      user,
      action,
      details,
      date: details.timestamp || new Date(),
    });
    delete log.user.password;
    return await this.historyRepository.save(log);
  }

  async findHistoriesByUserId(userId: string): Promise<History[]> {
    return this.historyRepository.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
    });
  }

  async findAllHistories(): Promise<History[]> {
    return this.historyRepository.find({
      relations: ['user'],
      order: { date: 'DESC' },
    });
  }
}
