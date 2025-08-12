// NestJS'in gerekli dekoratörleri ve yardımcıları import ediliyor
import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
// Auth işlemlerini yapan servis
import { AuthService } from './auth.service';
// Kayıt işlemleri için DTO (Data Transfer Object)
import { RegisterDto } from './dto/register.dto';
// Giriş işlemleri için DTO
import { LoginDto } from './dto/login.dto';
// JWT veya başka stratejiler için kullanılacak Guard
import { AuthGuard } from '@nestjs/passport';
// HTTP isteklerini temsil eden Express tipi
import { Request } from 'express';
// Swagger için auth ve grup etiketleri
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// JWT ile taşınacak payload yapısı (örneğin email)
interface JwtPayload {
  email: string;
}

// Swagger dokümantasyonunda bu controller'ı "Auth" isimli grup altında toplar
@ApiTags('Auth')
// Bu controller'a gelen tüm isteklerin "/auth" prefix'i olur
@Controller('auth')
export class AuthController {
  // Servis dependency injection ile alınıyor
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register -> Kullanıcı kayıt endpoint'i
  @Post('register')
  register(@Body() body: RegisterDto) {
    // AuthService içindeki register metodunu çağırır
    return this.authService.register(body);
  }

  // POST /auth/login -> Kullanıcı giriş endpoint'i
  @Post('login')
  login(@Body() body: LoginDto) {
    // AuthService içindeki login metodunu çağırır
    return this.authService.login(body);
  }

  // GET /auth/profile -> JWT ile giriş yapmış kullanıcının profilini döner
  @Get('profile')
  // Sadece JWT doğrulaması geçen kullanıcılar erişebilir
  @UseGuards(AuthGuard('jwt'))
  // Swagger dokümantasyonunda Bearer Token ile bu endpoint'in korunacağını gösterir
  @ApiBearerAuth('access-token') // 'access-token' main.ts'deki addBearerAuth ile aynı olmalı
  getProfile(@Req() req: Request & { user: JwtPayload }) {
    // AuthGuard sayesinde req.user içinde JWT'den gelen bilgiler bulunur
    return req.user;
  }
}
