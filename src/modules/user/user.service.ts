import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as argon2 from 'argon2';
import { HistoryService } from '../history/history.service';
import { User } from './entities/user.entity';
import { REQUEST } from '@nestjs/core';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => HistoryService))
    private readonly historyService: HistoryService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private get userId(): string {
    return this.request['userId'];
  }

  async findAll(name?: string, start?: number, end?: number): Promise<User[]> {
    try {
      const users = await this.userRepository.findAllWithCondition(name, start, end);
      await this.historyService.createLog('USER', {
        action: 'retrieveAll',
        details: { name, start, end, users },
        date: new Date(),
      });

      return users;
    } catch (error) {
      console.error('Hata Detayı:', error);
      throw new BadRequestException('Could not retrieve users');
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findUserById(id);
      return user;
    } catch (error) {
      throw new BadRequestException('Could not retrieve user');
    }
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findUserById(this.userId);

      Object.assign(user, updateUserDto);
      await this.userRepository.updateUser(user);

      await this.historyService.createLog('USER', {
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
      const user = await this.userRepository.findUserById(this.userId);

      const isPasswordValid = await argon2.verify(user.password, updatePasswordDto.oldPassword);
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      user.password = await argon2.hash(updatePasswordDto.newPassword);
      await this.userRepository.updateUser(user);

      await this.historyService.createLog('USER', {
        action: 'updatePassword',
        details: { updatePasswordDto },
        date: new Date(),
      });
    } catch (error) {
      throw new BadRequestException('Could not update password');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findUserById(userId);

      await this.historyService.createLog('USER', {
        action: 'delete',
        details: { user },
        date: new Date(),
      });

      await this.userRepository.deleteUserById(userId);
    } catch (error) {
      throw new BadRequestException('Could not delete user');
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userRepository.findUserByEmail(email);
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async createNewUser(newUser: CreateUserDto): Promise<User> {
    return await this.userRepository.createNewUser(newUser);
  }
}
