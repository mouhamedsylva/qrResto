import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMenuItemDto {
  @ApiProperty({
    example: 'Burger Maison',
    description: 'Nom du plat ou de la boisson',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Boeuf bio, cheddar, sauce secrète, frites maison',
    description: 'Description détaillée',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 15.5,
    description: 'Prix en euros',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    example: 'https://example.com/burger.jpg',
    description: "URL de l'image du produit",
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    example: 'Best seller',
    description: 'Label du badge (ex: Signature, Nouveau)',
    required: false,
  })
  @IsString()
  @IsOptional()
  badgeLabel?: string;

  @ApiProperty({
    example: '#b91c1c',
    description: 'Couleur du badge au format hexadécimal',
    required: false,
  })
  @IsString()
  @IsOptional()
  badgeColor?: string;

  @ApiProperty({
    example: 50,
    description: 'Quantité en stock',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQty?: number;

  @ApiProperty({
    example: 5,
    description: "Seuil d'alerte de stock faible",
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @ApiProperty({
    example: 1,
    description: "Ordre d'affichage dans la catégorie",
    required: false,
  })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({
    example: true,
    description: 'Article actif ou non',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description: 'Plat du jour',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isDishOfDay?: boolean;

  @ApiProperty({
    example: 15,
    description: 'Temps de préparation en minutes',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  prepTime?: number;

  @ApiProperty({
    example: 450,
    description: 'Calories (kcal)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  calories?: number;

  @ApiProperty({
    example: ['gluten', 'lactose', 'nuts'],
    description: 'Liste des allergènes',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  allergens?: string[];

  @ApiProperty({
    example: ['vegan', 'gluten-free'],
    description: 'Labels diététiques (vegan, vegetarian, halal, gluten-free)',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  dietaryLabels?: string[];

  @ApiProperty({
    example: [0, 1, 2, 3, 4, 5, 6],
    description: 'Jours de disponibilité (0=Dimanche, 6=Samedi)',
    required: false,
    type: [Number],
  })
  @IsArray()
  @IsOptional()
  availableDays?: number[];

  @ApiProperty({
    example: 'Entrées chaudes',
    description: 'Nom de la sous-catégorie',
    required: false,
  })
  @IsString()
  @IsOptional()
  subcategoryName?: string;

  @ApiProperty({
    example: 'uuid-v4-category-id',
    description: 'ID de la catégorie parente',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
