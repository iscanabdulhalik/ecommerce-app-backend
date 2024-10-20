import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  date: Date;

  @Column()
  from: string;

  @Column({ type: 'jsonb' })
  details: Record<string, any>; // JSON formatinda veri saklamak icin

  @ManyToOne(() => User, (user) => user.history, { onDelete: 'CASCADE' })
  user: User;
}
