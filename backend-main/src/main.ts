// NestJS core modüllerinden NestFactory import ediliyor (uygulamayı başlatmak için gerekli)
import { NestFactory } from '@nestjs/core';

// Fastify kullanmak için gerekli adapter ve tipler import ediliyor
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

// Rate limit (istek sınırlandırma) eklentisi import ediliyor
import rateLimit from '@fastify/rate-limit';

// Ana AppModule import ediliyor
import { AppModule } from './app.module';

// Swagger dokümantasyonu için gerekli modüller
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Fastify ile statik dosya servis etmek için gerekli eklenti
import fastifyStatic from '@fastify/static';

// Dosya yükleme (multipart/form-data) desteği için eklenti
import multipart from '@fastify/multipart';

// Dosya ve klasör yollarını yönetmek için
import { join } from 'path';

// Global doğrulama (ValidationPipe) için
import { ValidationPipe } from '@nestjs/common';

// Klasör var mı kontrol etmek için
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  // Uygulama Fastify ile başlatılıyor
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Dosya yükleme özelliği aktif ediliyor
  await app.register(multipart);

  // "uploads" klasörü yoksa oluştur
  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
  console.log('Uploads directory:', uploadDir);

  // Statik dosya servisi ayarlanıyor (uploads klasörü dışarıya açılıyor)
  await app.register(fastifyStatic, {
    root: uploadDir,       // Dosyaların bulunduğu klasör
    prefix: '/uploads/',   // URL'den erişim yolu
  });

  // Rate limit (1 dakikada max 1000 istek)
  await app.register(rateLimit, {
    max: 1000,
    timeWindow: '1 minute',
  });

  // Global validation pipe (DTO doğrulaması)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO’da tanımlı olmayan alanları siler
      forbidNonWhitelisted: true, // DTO dışında alan varsa hata verir
      transform: true, // Tip dönüşümlerini otomatik yapar
    }),
  );

  // Swagger API dokümantasyonu ayarı
  const config = new DocumentBuilder()
    .setTitle('Kullanıcı API') // API başlığı
    .setDescription('Kullanıcı ve ürün yönetimi API dokümantasyonu') // Açıklama
    .setVersion('1.0') // Versiyon
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // Swagger’da auth butonunun ismi
    )
    .build();

  // Swagger dokümanı oluşturuluyor
  const document = SwaggerModule.createDocument(app, config);

  // Swagger arayüzü "/api" adresinden erişilebilir olacak
  SwaggerModule.setup('api', app, document);

  // Sunucuyu başlat (PORT .env'den okunur, yoksa 3000 kullanılır)
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
