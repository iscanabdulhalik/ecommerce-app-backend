import {
  Controller,
  UseGuards,
  Get,
  Param,
  Put,
  Body,
  Req,
  Delete,
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @Put('/password')
  // async updatePassword(
  //   @Req() req: Request,
  //   @Body() updatePasswordDto: UpdatePasswordDto,
  // ) {
  //   const userId = req.user?.userId;
  //   return this.userService.updatePassword(userId, updatePasswordDto);
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: Request) {
    const adminId = req.user.userId;
    return this.userService.deleteUser(id, adminId);
  }
}
