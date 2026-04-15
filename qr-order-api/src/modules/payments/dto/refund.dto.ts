import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefundDto {
  @ApiProperty({ example: 'payment-id-123' })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({
    example: 10.5,
    required: false,
    description: 'Amount to refund. If not provided, full refund is assumed.',
  })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiProperty({ example: 'Customer requested cancellation', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
