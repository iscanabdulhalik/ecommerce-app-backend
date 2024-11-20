import {
  Controller,
  UseGuards,
  Get,
  Param,
  Put,
  Body,
  Delete,
  NotFoundException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';

@UseGuards(JwtAuthGuard, AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllUsers(
    @Query('name') name?: string,
    @Query('start') start = 1,
    @Query('end') end = 20,
  ) {
    try {
      return await this.userService.findAll(name, start, end);
    } catch (error) {
      throw new BadRequestException('Could not retrieve users');
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async getUserById(@Param('id') id: string) {
    try {
      return await this.userService.findOneById(id);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  @Put()
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.updateUser(updateUserDto);
    } catch (error) {
      throw new BadRequestException('User update failed');
    }
  }

  @Put('/password')
  async updatePassword(@Body() UpdatePasswordDto: UpdatePasswordDto) {
    try {
      return await this.userService.updatePassword(UpdatePasswordDto);
    } catch (error) {
      throw new BadRequestException('Password update failed');
    }
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @UseGuards(RolesGuard)
  async deleteUser(@Param('id') id: string) {
    try {
      return await this.userService.deleteUser(id);
    } catch (error) {
      throw new NotFoundException('User not found or could not be deleted');
    }
  }
}
