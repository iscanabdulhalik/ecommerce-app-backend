import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, ILike } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findAllWithCondition(name?: string, start?: number, end?: number): Promise<User[]> {
    const whereCondition = name ? { name: ILike(`%${name}%`) } : {};

    return await this.find({
      where: whereCondition,
      skip: start,
      take: end - start + 1,
    });
  }

  async findOneById(id: string): Promise<User> {
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
}
