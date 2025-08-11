import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique } from 'typeorm';
import { Purchase } from '../../purchase/entities/purchase.entity';
import { Exclude } from 'class-transformer';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  // @Index() KALKSIN
  @Column({ length: 255 })
  email!: string;

  @Column({ length: 255 })
  name!: string;

  @Exclude()
  @Column({ select: false })
  password!: string;

  @OneToMany(() => Purchase, (purchase) => purchase.user)
  purchases!: Purchase[];
}
