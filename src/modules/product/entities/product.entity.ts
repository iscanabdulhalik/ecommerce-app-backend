import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column('int')
  stock: number;

  @OneToMany(() => User, (user) => user.products)
  user: User;
}
