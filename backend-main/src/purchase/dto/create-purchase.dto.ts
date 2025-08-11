import { IsEmail, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  userEmail: string;

  @ApiProperty({ example: 'Elma' })
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  quantity: number;
}