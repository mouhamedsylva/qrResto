import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'uuid-v4-restaurant-id' })
  @IsUUID()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ example: 'price_12345' })
  @IsString()
  @IsNotEmpty()
  priceId: string;
}
