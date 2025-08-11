import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { ResponseDto } from '../common/dto/response.dto';

@Injectable()
export class PurchaseService {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
    @InjectRepository(Purchase)
    private readonly purchaseRepo: Repository<Purchase>,
  ) {}

  async create(
    data: { userEmail: string; productName: string; quantity: number }
  ): Promise<ResponseDto<Purchase | null>> {
    if (!Number.isInteger(data.quantity) || data.quantity < 1) {
      throw new BadRequestException('Adet en az 1 olmalı');
    }

    const user = await this.userService.getByEmailEntity(data.userEmail);
    if (!user) {
      return new ResponseDto<Purchase | null>(false, 'Kullanıcı bulunamadı', null, 'USER_NOT_FOUND');
    }

    const product = await this.productService.getByNameEntity(data.productName);
    if (!product) {
      return new ResponseDto<Purchase | null>(false, 'Ürün bulunamadı', null, 'PRODUCT_NOT_FOUND');
    }

    const unit = Number(product.price);
    const total = unit * data.quantity;
    if (!Number.isFinite(total) || total < 0) {
      throw new BadRequestException('Toplam fiyat hesaplanamadı');
    }

    const newPurchase = this.purchaseRepo.create({
      user,
      product,
      quantity: data.quantity,
      totalPrice: total.toFixed(2), 
    });

    const saved = await this.purchaseRepo.save(newPurchase);
    return new ResponseDto<Purchase>(true, 'Satın alma oluşturuldu', saved);
  }

  async findAll(): Promise<ResponseDto<Purchase[]>> {
    const list = await this.purchaseRepo.find({
      relations: ['user', 'product'],
      order: { id: 'DESC' },
    });
    return new ResponseDto<Purchase[]>(true, 'Satın almalar listelendi', list);
  }

  async findByUserEmail(email: string): Promise<ResponseDto<Purchase[]>> {
    const list = await this.purchaseRepo.find({
      where: { user: { email } },
      relations: ['product', 'user'],
      order: { id: 'DESC' },
    });
    return new ResponseDto<Purchase[]>(true, 'Kullanıcının satın almaları listelendi', list);
  }
}
