import { DataSource } from 'typeorm';
import { User } from './src/user/entities/user.entity';
import { Product } from './src/product/entities/product.entity';
import { Purchase } from './src/purchase/entities/purchase.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Product, Purchase],
  migrations: ['src/migrations/*.ts'],
});
