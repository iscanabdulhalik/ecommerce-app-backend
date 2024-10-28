import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Wallet } from 'src/modules/wallet/entities/wallet.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/modules/user/dto/login-user.dto';
import { JwtPayload } from 'src/common/types/jwtPayload';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    const newWallet = this.walletRepository.create({
      user: newUser,
      balance: 0,
    });

    await this.walletRepository.save(newWallet);

    return newUser;
  }

  async loginWithCredentials(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string }> {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    const wallet = await this.validateWallet(user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.login(user, wallet);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    return user;
  }

  async validateWallet(user: User): Promise<Wallet> {
    const userWallet = await this.walletRepository.findOne({
      where: { user: { id: user.id } },
    });
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
