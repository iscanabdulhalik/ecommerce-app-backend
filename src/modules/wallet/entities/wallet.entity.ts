import { User } from 'src/modules/user/entities/user.entity';
import { Column, PrimaryGeneratedColumn, OneToOne, Entity, JoinColumn } from 'typeorm';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @OneToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE', eager: false })
  @JoinColumn()
  user: User;
}
