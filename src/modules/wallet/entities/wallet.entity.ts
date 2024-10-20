import { User } from 'src/modules/user/entities/user.entity';
import { Column, PrimaryGeneratedColumn, OneToOne, Entity } from 'typeorm';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  balance: number;

  @OneToOne(() => User, (user) => user.wallet)
  user: User;
}
