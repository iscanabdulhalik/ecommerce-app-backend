import { PrimaryGeneratedColumn, Column } from 'typeorm';

export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  stock: number;
}