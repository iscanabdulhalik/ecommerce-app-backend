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
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserById(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateUser(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user?.userId;
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Put('/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Req() req: Request,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new NotFoundException('userId istek içerisinde bulunamadı');
    }
    return this.userService.updatePassword(userId, updatePasswordDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: Request) {
    const adminId = req.user.userId;
    return this.userService.deleteUser(id, adminId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findUsers(
    @Query('name') name: string,
    @Query('start') start: number,
    @Query('limit') limit: number,
  ) {
    return this.userService.findUsersByName(name, start, limit);
  }
}
