import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = any> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'İşlem başarıyla tamamlandı' })
  message!: string;

  @ApiProperty({ nullable: true })
  data?: T | null;

  @ApiProperty({ example: 'USER_NOT_FOUND', nullable: true, required: false })
  error?: string;

  constructor(success: boolean, message: string, data?: T | null, error?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  
  static ok<T>(data?: T, message = 'OK'): ResponseDto<T> {
    return new ResponseDto<T>(true, message, data);
  }
  static fail(message: string, error?: string): ResponseDto<null> {
    return new ResponseDto<null>(false, message, null, error);
  }
}
