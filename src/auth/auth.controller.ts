import {
  Controller,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { LoginUserDto } from 'src/modules/user/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: AuthService) {}

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
}
