import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PREPARING })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ example: 'Kitchen is busy, 10 min delay', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
