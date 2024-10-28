import {
  Controller,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { LoginUserDto } from 'src/modules/user/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly userService: AuthService) {}

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.register(createUserDto);
    } catch (error) {
      this.logger.error('Failed to register user', error.stack);
      throw new BadRequestException('Could not register user');
    }
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    try {
      return await this.userService.loginWithCredentials(loginUserDto);
    } catch (error) {
      this.logger.error(
        `Login failed for user: ${loginUserDto.email}`,
        error.stack,
      );

      throw new UnauthorizedException('Login failed. Invalid credentials.');
    }
  }
}
