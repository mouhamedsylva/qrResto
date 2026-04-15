import { IsEnum, IsString, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderEventType {
  CREATED = 'CREATED',
  STATUS_UPDATED = 'STATUS_UPDATED',
  PAYMENT_UPDATED = 'PAYMENT_UPDATED',
  CANCELLED = 'CANCELLED',
}

export class OrderEventDto {
  @ApiProperty({ enum: OrderEventType })
  @IsEnum(OrderEventType)
  type: OrderEventType;

  @ApiProperty({ example: 'order-uuid-123' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ required: false })
  @IsObject()
  data?: any;
}
