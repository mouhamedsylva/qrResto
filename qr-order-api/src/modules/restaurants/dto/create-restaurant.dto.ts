import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'My Awesome Restaurant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Le meilleur restaurant de la ville', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123 Gourmet St, Food City', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '+221776589645', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: 'contact@restaurant.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'https://logo.url', required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}
