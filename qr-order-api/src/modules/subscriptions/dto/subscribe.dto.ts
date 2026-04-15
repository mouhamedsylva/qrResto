import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({ example: 'price_12345' })
  @IsString()
  @IsNotEmpty()
  priceId: string;
}
