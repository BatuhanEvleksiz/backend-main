// src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';  // Şifreleri hashlemek için kütüphane
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseDto } from '../common/dto/response.dto';

@Injectable()  // Bu servis, NestJS tarafından bağımlılık enjeksiyonu ile yönetilir
export class AuthService {
  constructor(
    private readonly userService: UserService,  // Kullanıcı işlemleri için servis
    private readonly jwtService: JwtService,    // JWT token oluşturmak için servis
  ) {}

  // Yeni kullanıcı kaydı yapmak için fonksiyon
  async register(
    userData: RegisterDto
  ): Promise<ResponseDto<{ id: number; name: string; email: string }>> {

    // Kullanıcıdan gelen email küçük harfe çevrilip boşluklar temizleniyor
    const email = userData.email.toLowerCase().trim();
    // Kullanıcıdan gelen isim boşluklardan arındırılıyor
    const name = userData.name.trim();

    // Aynı email ile kayıtlı kullanıcı var mı diye kontrol ediliyor
    const existing = await this.userService.getByEmailEntity(email);
    if (existing) {
      // Eğer varsa, ConflictException fırlatılıyor (HTTP 409)
      throw new ConflictException('Bu email zaten kayıtlı');
    }

    // Şifre güvenli hale getirmek için hashleniyor (10 tur)
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Yeni kullanıcı veritabanına kaydediliyor
    const created = await this.userService.createResponse({
      name,
      email,
      password: hashedPassword,
    });

    // Kayıt başarısızsa, ResponseDto ile hata mesajı dönülüyor
    if (!created.success || !created.data) {
      return new ResponseDto<{ id: number; name: string; email: string }>(
        false,
        'Kullanıcı oluşturulamadı',
        null,
        'USER_CREATE_FAILED',
      );
    }

    // Kayıt başarılıysa, kullanıcının id, email ve ismi alınıyor
    const { id, email: e, name: n } = created.data;
    // Başarılı yanıt ResponseDto ile dönülüyor
    return new ResponseDto<{ id: number; name: string; email: string }>(
      true,
      'Kullanıcı oluşturuldu',
      { id, name: n, email: e },
    );
  }

  // Kullanıcı girişi (login) için fonksiyon
  async login(
    { email, password }: LoginDto
  ): Promise<ResponseDto<{ access_token: string }>> {

    // Email normalize ediliyor (küçük harf, boşluksuz)
    const normalized = email.toLowerCase().trim();

    // Email ile kullanıcı ve şifre bilgisi veritabanından çekiliyor
    const user = await this.userService.getByEmailWithPasswordEntity(normalized);

    // Hatalı giriş durumu için exception hazırlandı
    const invalid = new UnauthorizedException('Email veya şifre hatalı');
    if (!user) throw invalid;  // Kullanıcı yoksa hata fırlat

    // Kullanıcının şifresi ile gönderilen şifre karşılaştırılıyor
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw invalid;  // Şifre uyuşmuyorsa hata fırlat

    // Giriş başarılı, JWT token için payload hazırlanıyor
    const payload = { sub: user.id, email: user.email };
    // JWT token oluşturuluyor
    const access_token = this.jwtService.sign(payload);

    // Token başarı mesajı ile dönülüyor
    return new ResponseDto<{ access_token: string }>(
      true,
      'Giriş başarılı',
      { access_token },
    );
  }
}
