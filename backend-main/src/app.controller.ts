// NestJS içinden Controller ve Get decorator'leri import ediliyor
import { Controller, Get } from '@nestjs/common';
// AppService import ediliyor (iş mantığı burada yazılı)
import { AppService } from './app.service';

// @Controller() → Bu sınıfın bir HTTP Controller olduğunu belirtir
// Parantez boş olduğu için bu controller root ('/') path'ini dinler
@Controller()
export class AppController {
  // Constructor üzerinden AppService dependency injection ile alınır
  // private readonly → Sadece bu sınıf içinde kullanılabilir ve değiştirilemez
  constructor(private readonly appService: AppService) {}

  // @Get() → HTTP GET isteğini karşılayacak bir endpoint oluşturur
  // URL: '/' olduğunda bu metod çalışır
  @Get()
  getHello(): string {
    // AppService içindeki getHello() metodunu çağırır ve döndürür
    return this.appService.getHello();
  }
}
