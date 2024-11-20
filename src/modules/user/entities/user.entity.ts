import {
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { Wallet } from 'src/modules/wallet/entities/wallet.entity';
import { History } from 'src/modules/history/entities/history.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true, onDelete: 'CASCADE' })
  wallet: Wallet;

  @OneToMany(() => History, (history) => history.user, { onDelete: 'CASCADE' })
  history: History[];

  @OneToMany(() => Product, (product) => product.user, { cascade: true })
  products: Product[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
