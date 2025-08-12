// NestJS'ten gerekli modüller import ediliyor
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Proje içindeki modüller import ediliyor
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { PurchaseModule } from './purchase/purchase.module';

// TypeORM ile kullanılacak entity'ler import ediliyor
import { User } from './user/entities/user.entity';
import { Product } from './product/entities/product.entity';
import { Purchase } from './purchase/entities/purchase.entity';

// Ortak kullanılan middleware import ediliyor
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    // .env dosyasındaki değişkenlerin tüm projede kullanılabilmesi için global config ayarı
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeORM veritabanı bağlantı ayarları
    TypeOrmModule.forRoot({
      type: 'mysql', // Veritabanı türü MySQL
      host: process.env.DB_HOST, // Veritabanı sunucu adresi
      port: parseInt(process.env.DB_PORT || '3306', 10), // Port numarası (string olarak gelirse int'e çeviriyoruz)
      username: process.env.DB_USERNAME, // Veritabanı kullanıcı adı
      password: process.env.DB_PASSWORD, // Veritabanı şifresi
      database: process.env.DB_NAME, // Kullanılacak veritabanı ismi
      entities: [User, Product, Purchase], // Kullanılacak tabloların entity'leri
      synchronize: true, // Entity değişikliklerini otomatik olarak DB'ye uygular (Production'da önerilmez!)
    }),

    // Modüllerin proje içine eklenmesi
    UserModule,
    AuthModule,
    ProductModule,
    PurchaseModule,
  ],
})
export class AppModule implements NestModule {
  // Middleware yapılandırması
  configure(consumer: MiddlewareConsumer) {
    // LoggerMiddleware tüm route'lara uygulanıyor
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
