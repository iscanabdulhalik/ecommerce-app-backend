import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { UserRepository } from './repository-user';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { HistoryService } from '../history/history.service';
import { User } from './entities/user.entity';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly historyService: HistoryService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private get userId(): string {
    return this.request['userId'];
  }

  async findAll(name?: string, start?: number, end?: number): Promise<User[]> {
    try {
      const users = await this.userRepository.findAllWithCondition(name, start, end);

      await this.historyService.createLog(this.userId, 'USER', {
        user: this.userId,
        action: 'retrieveAll',
        details: { users, start, end },
        date: new Date(),
      });

      return users;
    } catch (error) {
      throw new BadRequestException('Could not retrieve users');
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneById(id);

      await this.historyService.createLog(this.userId, 'USER', {
        user: this.userId,
        action: 'retrieveById',
        details: { user },
        date: new Date(),
      });
      return user;
    } catch (error) {
      throw new BadRequestException('Could not retrieve user');
    }
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOneById(this.userId);

      Object.assign(user, updateUserDto);
      await this.userRepository.updateUser(user);

      await this.historyService.createLog(this.userId, 'USER', {
        user: this.userId,
        action: 'update',
        details: { updateUserDto },
        date: new Date(),
      });

      return user;
    } catch (error) {
      throw new BadRequestException('Could not update user');
    }
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto): Promise<void> {
    try {
      console.log(this.userId);
      const user = await this.userRepository.findOneById(this.userId);
      const isPasswordValid = await bcrypt.compare(updatePasswordDto.oldPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(updatePasswordDto.newPassword, salt);
      await this.userRepository.updateUser(user);

      await this.historyService.createLog(this.userId, 'USER', {
        user: this.userId,
        action: 'updatePassword',
        details: { updatePasswordDto },
        date: new Date(),
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Could not update password');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOneById(userId);

      await this.historyService.createLog(this.userId, 'USER', {
        user: this.userId,
        action: 'delete',
        details: { user },
        date: new Date(),
      });

      await this.userRepository.deleteUserById(userId);
    } catch (error) {
      throw new BadRequestException('Could not delete user');
    }
  }
}
