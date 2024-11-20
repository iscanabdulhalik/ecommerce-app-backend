import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { Wallet } from 'src/modules/wallet/entities/wallet.entity';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/modules/user/dto/login-user.dto';
import { JwtPayload } from 'src/common/types/jwtPayload';
import { UserService } from 'src/modules/user/user.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;

    const existingUser = await this.userService.findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    return await this.dataSource.transaction(async (manager) => {
      const hashedPassword = await argon2.hash(createUserDto.password);
      const userToSave = {
        ...createUserDto,
        password: hashedPassword,
      };

      const newUser = await manager.getRepository(User).save(userToSave);

      if (!newUser) {
        throw new BadRequestException('Failed to create user');
      }

      const walletToSave = {
        user: newUser,
        balance: 0,
      };

      const newWallet = await manager.getRepository(Wallet).save(walletToSave);

      if (!newWallet) {
        throw new BadRequestException('Failed to create wallet');
      }

      delete newUser.password;

      return newUser;
    });
  }

  async loginWithCredentials(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials: User not found.');
    }

    const wallet = await this.validateWallet();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.login(user, wallet);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials: User not found.');
    }

    try {
      const isPasswordValid = await argon2.verify(user.password, password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials: Incorrect password.');
      }

      return user;
    } catch (error) {
      console.error('Error during user validation:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateWallet(): Promise<Wallet> {
    if (!Wallet) {
      throw new UnauthorizedException('Invalid credentials: Wallet not found.');
    }
    const userWallet = await this.walletService.findWalletByUserId();

    if (!userWallet) {
      throw new UnauthorizedException('Invalid credentials: Wallet not found.');
    }

    return userWallet;
  }

  async login(user: User, wallet: Wallet): Promise<{ access_token: string }> {
    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      walletId: wallet.id,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
