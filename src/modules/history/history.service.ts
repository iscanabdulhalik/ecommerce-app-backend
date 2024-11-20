import { Injectable, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { HistoryRepository } from './history.repository';
import { UserService } from 'src/modules/user/user.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class HistoryService {
  constructor(
    private readonly historyRepository: HistoryRepository,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private get userId(): string {
    return this.request['userId'];
  }
  async createLog(action: string, details: Record<string, any>) {
    const user = await this.userService.findOneById(this.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return await this.historyRepository.createHistoryLog(user, action, details);
  }

  async findByUserId(userId: string) {
    return await this.userService.findOneById(userId);
  }

  async findAll() {
    return await this.historyRepository.findAllHistories();
  }
}
