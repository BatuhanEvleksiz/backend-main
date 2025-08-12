// NestJS'ten Injectable decorator'ü import ediliyor
// Injectable → Bu sınıfın başka sınıflara "dependency injection" ile verilebileceğini belirtir
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // getHello() metodu → Basit bir string döndürüyor
  getHello(): string {
    return 'Hello World!'; // Burada örnek olarak "Hello World!" sabit metni döndürülüyor
  }
}
