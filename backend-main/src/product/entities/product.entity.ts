import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique } from 'typeorm';
import { Purchase } from '../../purchase/entities/purchase.entity';

@Entity()
@Unique(['name'])
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  // @Index() KALKSIN
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @OneToMany(() => Purchase, (purchase) => purchase.product)
  purchases!: Purchase[];
}
