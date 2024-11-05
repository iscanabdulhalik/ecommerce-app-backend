import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column()
  action: string;

  @Column({ type: 'jsonb' })
  details: Record<string, any>;

  @ManyToOne(() => User, (user) => user.history, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;

  @ManyToOne(() => Product, (product) => product.history, {
    onDelete: 'CASCADE',
    eager: true,
  })
  product: Product;
}
