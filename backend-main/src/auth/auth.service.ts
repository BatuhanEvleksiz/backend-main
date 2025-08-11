// src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseDto } from '../common/dto/response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    userData: RegisterDto
  ): Promise<ResponseDto<{ id: number; name: string; email: string }>> {
    const email = userData.email.toLowerCase().trim();
    const name = userData.name.trim();

    // Aynı email varsa 409
    const existing = await this.userService.getByEmailEntity(email);
    if (existing) {
      throw new ConflictException('Bu email zaten kayıtlı');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    
    const created = await this.userService.createResponse({
      name,
      email,
      password: hashedPassword,
    });

    if (!created.success || !created.data) {
      
      return new ResponseDto<{ id: number; name: string; email: string }>(
        false,
        'Kullanıcı oluşturulamadı',
        null,
        'USER_CREATE_FAILED',
      );
    }

    const { id, email: e, name: n } = created.data;
    return new ResponseDto<{ id: number; name: string; email: string }>(
      true,
      'Kullanıcı oluşturuldu',
      { id, name: n, email: e },
    );
  }

  async login(
    { email, password }: LoginDto
  ): Promise<ResponseDto<{ access_token: string }>> {
    const normalized = email.toLowerCase().trim();

    
    const user = await this.userService.getByEmailWithPasswordEntity(normalized);

    const invalid = new UnauthorizedException('Email veya şifre hatalı');
    if (!user) throw invalid;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw invalid;

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return new ResponseDto<{ access_token: string }>(
      true,
      'Giriş başarılı',
      { access_token },
    );
  }
}
