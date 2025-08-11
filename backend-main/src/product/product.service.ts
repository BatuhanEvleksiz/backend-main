import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseDto } from '../common/dto/response.dto';

@Injectable()
export class ProductService {
  findByName(name: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  

  async findAll(): Promise<ResponseDto<Product[]>> {
    const list = await this.productRepo.find({ order: { id: 'DESC' } });
    return new ResponseDto<Product[]>(true, 'Ürünler listelendi', list);
  }

  async getByNameResponse(name: string): Promise<ResponseDto<Product | null>> {
    const product = await this.getByNameEntity(name);
    if (!product) {
      return new ResponseDto<Product | null>(false, 'Ürün bulunamadı', null, 'PRODUCT_NOT_FOUND');
    }
    return new ResponseDto<Product>(true, 'Ürün bulundu', product);
  }

  async create(dto: CreateProductDto): Promise<ResponseDto<Product>> {
    const exists = await this.productRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Bu ürün zaten mevcut'); // 409

    const priceNum = Number(dto.price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      throw new BadRequestException('Fiyat 0 veya daha büyük olmalı');
    }

    
    const entity = this.productRepo.create({
      name: dto.name.trim(),
      price: priceNum.toFixed(2),
    });

    try {
      const saved = await this.productRepo.save(entity);
      return new ResponseDto<Product>(true, 'Ürün oluşturuldu', saved);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Bu ürün zaten mevcut');
      }
      throw e;
    }
  }

  async update(name: string, dto: UpdateProductDto): Promise<ResponseDto<Product | null>> {
    const product = await this.getByNameEntity(name);
    if (!product) {
      return new ResponseDto<Product | null>(false, 'Ürün bulunamadı', null, 'PRODUCT_NOT_FOUND');
    }

    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.price !== undefined) {
      const priceNum = Number(dto.price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        throw new BadRequestException('Fiyat 0 veya daha büyük olmalı');
      }
      product.price = priceNum.toFixed(2); 
    }

    try {
      const saved = await this.productRepo.save(product);
      return new ResponseDto<Product>(true, 'Ürün güncellendi', saved);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Bu ürün zaten mevcut');
      }
      throw e;
    }
  }

  async delete(name: string): Promise<ResponseDto<{ id: number; name: string } | null>> {
    const product = await this.getByNameEntity(name);
    if (!product) {
      return new ResponseDto<{ id: number; name: string } | null>(
        false,
        'Ürün bulunamadı',
        null,
        'PRODUCT_NOT_FOUND',
      );
    }

    await this.productRepo.remove(product);
    return new ResponseDto<{ id: number; name: string }>(
      true,
      'Ürün silindi',
      { id: product.id, name: product.name },
    );
  }

  async setImageUrlByName(name: string, imageUrl: string): Promise<ResponseDto<Product | null>> {
    const product = await this.getByNameEntity(name);
    if (!product) {
      return new ResponseDto<Product | null>(false, 'Ürün bulunamadı', null, 'PRODUCT_NOT_FOUND');
    }

    product.imageUrl = imageUrl;
    const saved = await this.productRepo.save(product);
    return new ResponseDto<Product>(true, 'Ürün görseli güncellendi', saved);
  }

  
  getByNameEntity(name: string) {
    return this.productRepo.findOne({ where: { name } });
  }
}
