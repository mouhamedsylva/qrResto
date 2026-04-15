import { IsNumber, IsString, IsNotEmpty, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 15.5 })
  @IsNumber()
  @Min(0.5)
  amount: number;

  @ApiProperty({ example: 'eur', default: 'eur' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 'order-uuid-123' })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
