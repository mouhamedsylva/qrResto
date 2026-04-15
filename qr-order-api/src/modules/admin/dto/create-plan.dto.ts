import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ example: 'Plan Premium' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'price_123abc', description: 'ID du prix Stripe' })
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'EUR' })
  @IsString()
  currency: string;
}
