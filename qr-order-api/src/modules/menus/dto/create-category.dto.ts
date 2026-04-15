import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Entrées',
    description: 'Nom de la catégorie',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'uuid-v4-restaurant-id',
    description: 'ID du restaurant',
  })
  @IsUUID()
  @IsNotEmpty()
  restaurantId: string;
}
