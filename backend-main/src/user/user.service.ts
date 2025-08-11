import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseDto } from '../common/dto/response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Controller'larda direkt kullanılabilecek metotlar
  async create(body: CreateUserDto) {
    const email = body.email.toLowerCase().trim();

    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) {
      throw new ConflictException('Bu email zaten kullanımda'); // 409
    }

    const password = body.password.startsWith('$2b$')
      ? body.password
      : await bcrypt.hash(body.password, 10);

    const user = this.userRepo.create({
      name: body.name.trim(),
      email,
      password,
    });

    return this.userRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email: email.toLowerCase().trim() } });
  }

  // Tüm kullanıcıları listele
  async findAll(): Promise<ResponseDto<User[]>> {
    const users = await this.userRepo.find({ order: { id: 'DESC' } });
    return new ResponseDto<User[]>(true, 'Kullanıcılar listelendi', users);
  }

  // Email ile ResponseDto dönen versiyon
  async findByEmailResponse(email: string): Promise<ResponseDto<User | null>> {
    const user = await this.getByEmailEntity(email);
    if (!user) {
      return new ResponseDto<User | null>(false, 'Kullanıcı bulunamadı', null, 'USER_NOT_FOUND');
    }
    return new ResponseDto<User>(true, 'Kullanıcı bulundu', user);
  }

  // ResponseDto ile kullanıcı oluşturma
  async createResponse(data: CreateUserDto): Promise<ResponseDto<User>> {
    const email = data.email.toLowerCase().trim();

    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) {
      throw new ConflictException('Bu email zaten kullanımda'); // 409
    }

    const password = data.password.startsWith('$2b$')
      ? data.password
      : await bcrypt.hash(data.password, 10);

    const user = this.userRepo.create({
      name: data.name.trim(),
      email,
      password,
    });

    try {
      const saved = await this.userRepo.save(user);
      return new ResponseDto<User>(true, 'Kullanıcı başarıyla oluşturuldu', saved);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Bu email zaten kullanımda');
      }
      throw e;
    }
  }

  // Email ile kullanıcı silme
  async deleteByEmail(
    email: string,
  ): Promise<ResponseDto<{ id: number; email: string; name: string } | null>> {
    const user = await this.getByEmailEntity(email);
    if (!user) {
      return new ResponseDto<null>(false, 'Silinecek kullanıcı bulunamadı', null, 'USER_NOT_FOUND');
    }

    await this.userRepo.remove(user);
    return new ResponseDto<{ id: number; email: string; name: string }>(
      true,
      'Kullanıcı silindi',
      { id: user.id, email: user.email, name: user.name },
    );
  }

  // Email ile kullanıcı güncelleme
  async updateByEmail(email: string, data: UpdateUserDto): Promise<ResponseDto<User | null>> {
    const user = await this.getByEmailEntity(email);
    if (!user) {
      return new ResponseDto<User | null>(false, 'Kullanıcı bulunamadı', null, 'USER_NOT_FOUND');
    }

    if (data.name) user.name = data.name.trim();

    if (data.email) {
      const newEmail = data.email.toLowerCase().trim();
      if (newEmail !== user.email) {
        const taken = await this.userRepo.findOne({ where: { email: newEmail } });
        if (taken) throw new ConflictException('Bu email zaten kullanımda');
        user.email = newEmail;
      }
    }

    if (data.password && data.password.trim() !== '') {
      user.password = await bcrypt.hash(data.password, 10);
    }

    try {
      const saved = await this.userRepo.save(user);
      return new ResponseDto<User>(true, 'Kullanıcı güncellendi', saved);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Bu email zaten kullanımda');
      }
      throw e;
    }
  }

  // Email ile kullanıcı entity'si alma
  getByEmailEntity(email: string) {
    return this.userRepo.findOne({ where: { email: email.toLowerCase().trim() } });
  }

  // Auth için password ile birlikte kullanıcı alma
  async getByEmailWithPasswordEntity(email: string) {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: email.toLowerCase().trim() })
      .getOne();
  }
}
