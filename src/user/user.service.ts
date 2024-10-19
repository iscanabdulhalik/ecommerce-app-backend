import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/types/jwtPayload';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<any> {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (existingUser) {
      throw new Error('this user already exist');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    return {
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        surname: newUser.surname,
        role: newUser.role,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user; // Kullanıcı doğruysa, kullanıcıyı döndür
    }
    return null; // Şifre ya da email yanlışsa null döndür
  }

  // Kullanıcı login olduğunda JWT token oluştur
  async login(user: User): Promise<any> {
    const payload: JwtPayload = {
      user: {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  //tüm kullanıcıları döndürür
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
