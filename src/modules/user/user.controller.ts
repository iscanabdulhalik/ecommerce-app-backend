import {
  Controller,
  UseGuards,
  Get,
  Param,
  Put,
  Body,
  Req,
  Delete,
  NotFoundException,
  Query,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import Express from 'express';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllUsers(
    @Req() req: Express.Request,
    @Query('name') name?: string,
    @Query('start') start = 1,
    @Query('end') end = 20,
  ) {
    try {
      const userId = req.user['userId'];
      return await this.userService.findAll(name, start, end, userId);
    } catch (error) {
      this.logger.error('Failed to retrieve users', error.stack);
      throw new BadRequestException('Could not retrieve users');
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserById(@Param('id') id: string) {
    try {
      return await this.userService.findOneById(id);
    } catch (error) {
      this.logger.error(`Failed to get user with ID: ${id}`, error.stack);
      throw new NotFoundException('User not found');
    }
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Req() req: Express.Request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const userId = req.userId;
      return await this.userService.updateUser(userId, updateUserDto);
    } catch (error) {
      this.logger.error('Failed to update user', error.stack);
      throw new BadRequestException('User update failed');
    }
  }

  @Put('/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Req() req: Express.Request,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new NotFoundException('userId not found in request');
      }
      return await this.userService.updatePassword(userId, updatePasswordDto);
    } catch (error) {
      this.logger.error('Failed to update password', error.stack);
      throw new BadRequestException('Password update failed');
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: Express.Request) {
    try {
      const adminId = req.userId;
      return await this.userService.deleteUser(id, adminId);
    } catch (error) {
      this.logger.error(`Failed to delete user with ID: ${id}`, error.stack);
      throw new NotFoundException('User not found or could not be deleted');
    }
  }
}
