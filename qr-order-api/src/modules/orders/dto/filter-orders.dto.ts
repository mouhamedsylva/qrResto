import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus, OrderType } from '../entities/order.entity';

export class FilterOrdersDto {
  @ApiProperty({ enum: OrderStatus, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiProperty({ enum: OrderType, required: false })
  @IsEnum(OrderType)
  @IsOptional()
  type?: OrderType;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  toDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tableId?: string;
}
