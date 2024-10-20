import { Controller, UseGuards, Get, Param, Put, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt.auth.guard';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from './role/role.guard';
import { Roles } from './role/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

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
}
