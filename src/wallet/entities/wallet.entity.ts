import { User } from 'src/user/entities/user.entity';
import {
    Entity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryColumn,
    UpdateDateColumn,
    OneToOne,
  } from 'typeorm';

export class Wallet {
    
    @PrimaryColumn({ generated: 'uuid' })
    id: string;

    @Column()
    balance: number;
    
    @OneToOne(() => User, user => user.wallet)
    user: User;

}
