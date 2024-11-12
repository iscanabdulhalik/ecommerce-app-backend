import { Injectable, BadRequestException } from '@nestjs/common';
import { HistoryRepository } from './product.history';

@Injectable()
export class HistoryService {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async createLog(userId: string, action: string, details: Record<string, any>) {
    const user = await this.historyRepository.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return await this.historyRepository.createHistoryLog(user, action, details);
  }

  async findByUserId(userId: string) {
    return await this.historyRepository.findHistoriesByUserId(userId);
  }

  async findAll() {
    return await this.historyRepository.findAllHistories();
  }
}
