import {
  Controller,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
  UseGuards,
  Request,
  Get,
  ForbiddenException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './jwt/jwt.auth.guard';
import { JwtPayload } from 'jsonwebtoken';
import { Role } from 'src/common/enums/role.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  @HttpCode(200)
  create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.userService.register(createUserDto);
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.userService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.userService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/users')
  async getAllUsers(@Request() req: ExpressRequest): Promise<any> {
    const user = req.user as JwtPayload; //jwtden gelen user bilgileri
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Buraya sadece Admin erişebilir');
    }

    return this.userService.findAll();
  }
}
