import { Controller, UseGuards, Request, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt.auth.guard';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from './role/role.guard';
import { Roles } from './role/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }
}
