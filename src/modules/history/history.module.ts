import { forwardRef, Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { UserModule } from '../user/user.module';
import { HistoryRepository } from './product.history';

@Module({
  imports: [TypeOrmModule.forFeature([History]), forwardRef(() => UserModule)],
  controllers: [HistoryController],
  providers: [HistoryService, HistoryRepository],
  exports: [HistoryService],
})
export class HistoryModule {}
