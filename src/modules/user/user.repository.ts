import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, ILike, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findAllWithCondition(name?: string, start?: number, end?: number): Promise<User[]> {
    try {
      const whereCondition = name ? { name: ILike(`%${name}%`) } : {};

      const users = await this.find({
        where: whereCondition,
        skip: start,
        take: end - start + 1,
      });

      return users;
    } catch (error) {
      console.error('Veritabanı Hatası:', error);
      throw error;
    }
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(user: User): Promise<User> {
    return await this.save(user);
  }

  async deleteUserById(userId: string): Promise<void> {
    await this.delete({ id: userId });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.findOne({ where: { email } });
    return user;
  }

  async saveUser(user: User): Promise<User> {
    return this.save(user);
  }

  async createNewUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await argon2.hash(createUserDto.password);

    const newUser = this.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.save(newUser);
  }
}
