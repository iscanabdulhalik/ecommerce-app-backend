import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { History } from 'src/modules/history/entities/history.entity';

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

  @OneToMany(() => History, (history) => history.product)
  history: History[];
}
