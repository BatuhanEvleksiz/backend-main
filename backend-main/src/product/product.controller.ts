import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { FastifyRequest } from 'fastify';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getAll() {
    return this.productService.findAll();
  }

  @Get(':name')
  getByName(@Param('name') name: string) {
    return this.productService.findByName(name);
  }

  @Post()
  create(@Body(new ValidationPipe()) product: CreateProductDto) {
    return this.productService.create(product);
  }

  @Put(':name')
  update(@Param('name') name: string, @Body() data: CreateProductDto) {
    return this.productService.update(name, data);
  }

  @Delete(':name')
  delete(@Param('name') name: string) {
    return this.productService.delete(name);
  }

  @Post('upload/:name')
  async uploadImage(@Param('name') name: string, @Req() req: FastifyRequest) {
    const parts = req.parts();

    for await (const part of parts) {
      if (part.type === 'file') {
        const fileName = `${name.replace(/\s+/g, '_')}${extname(part.filename)}`;

        // Klasörün tam yolunu al (mutlak yol)
        const uploadDir = join(__dirname, '..', '..', 'uploads');

        // Klasör yoksa oluştur
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
          console.log('📁 uploads klasörü oluşturuldu:', uploadDir);
        }

        const filePath = join(uploadDir, fileName);
        console.log('📄 Yazılıyor:', filePath);

        const writeStream = createWriteStream(filePath);
        part.file.pipe(writeStream);

        return {
          message: 'Dosya yüklendi',
          filePath: `/uploads/${fileName}`,
        };
      }
    }

    return { message: 'Dosya bulunamadı' };
  }
}
