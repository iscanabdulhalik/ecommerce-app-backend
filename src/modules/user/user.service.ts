import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { HistoryService } from '../history/history.service';

@Injectable()
export class UserService {
  logger: Logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly historyService: HistoryService,
  ) {}

  async findAll(
    name?: string,
    start?: number,
    end?: number,
    userId?: string,
  ): Promise<User[]> {
    try {
      const whereCondition = name ? { name: ILike(`%${name}%`) } : {};

      await this.historyService.createLog(userId, 'USER', {
        user: userId,
        action: 'retrieveAll',
        details: { whereCondition, start, end },
        date: new Date(),
      });

      return await this.userRepository.find({
        where: whereCondition,
        skip: start,
        take: end - start + 1,
      });
    } catch (error) {
      await this.historyService.createLog(userId, 'USER_ERROR', {
        user: userId,
        action: 'retrieveAllError',
        details: { error: error.stack },
        date: new Date(),
      });
      throw new BadRequestException('Could not retrieve users');
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.historyService.createLog(id, 'USER', {
        user: id,
        action: 'retrieveById',
        details: { user },
        date: new Date(),
      });
      return user;
    } catch (error) {
      await this.historyService.createLog(id, 'USER_ERROR', {
        user: id,
        action: 'retrieveByIdError',
        details: { error: error.stack },
        date: new Date(),
      });
      throw new BadRequestException('Could not retrieve user');
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      Object.assign(user, updateUserDto);

      await this.userRepository.save(user);

      await this.historyService.createLog(id, 'USER', {
        user: id,
        action: 'update',
        details: { updateUserDto },
        date: new Date(),
      });

      return user;
    } catch (error) {
      await this.historyService.createLog(id, 'USER_ERROR', {
        user: id,
        action: 'updateError',
        details: { error: error.stack },
        date: new Date(),
      });
      throw new BadRequestException('Could not update user');
    }
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(
        updatePasswordDto.oldPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      const salt = await bcrypt.genSalt();
      const hashedNewPassword = await bcrypt.hash(
        updatePasswordDto.newPassword,
        salt,
      );

      user.password = hashedNewPassword;
      await this.historyService.createLog(id, 'USER', {
        user: id,
        action: 'updatePassword',
        details: { updatePasswordDto },
        date: new Date(),
      });
      await this.userRepository.save(user);
    } catch (error) {
      await this.historyService.createLog(id, 'USER_ERROR', {
        user: id,
        action: 'updatePasswordError',
        details: { error: error.stack },
        date: new Date(),
      });
      throw new BadRequestException('Could not update password');
    }
  }

  async deleteUser(userId: string, adminId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.historyService.createLog(adminId, 'USER', {
        user: adminId,
        action: 'delete',
        details: { user },
        date: new Date(),
      });
      await this.userRepository.delete({ id: userId });
    } catch (error) {
      await this.historyService.createLog(adminId, 'USER_ERROR', {
        user: adminId,
        action: 'deleteError',
        details: { error: error.stack },
        date: new Date(),
      });
      throw new BadRequestException('Could not delete user');
    }
  }
}
