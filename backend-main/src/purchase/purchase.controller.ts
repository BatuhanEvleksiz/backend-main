import { Controller, Post, Get, Body, Param, ValidationPipe } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  create(@Body(new ValidationPipe()) body: CreatePurchaseDto) {
    return this.purchaseService.create(body);
  }

  @Get()
  getAll() {
    return this.purchaseService.findAll();
  }

  @Get(':email')
  getByUser(@Param('email') email: string) {
    return this.purchaseService.findByUserEmail(email);
  }
}
