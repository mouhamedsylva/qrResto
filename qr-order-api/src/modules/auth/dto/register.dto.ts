import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'owner@restaurant.com',
    description: "L'adresse email du nouvel utilisateur",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Le mot de passe (min. 6 caractères)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Jean Dupont',
    description: "Le nom complet de l'utilisateur",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Le Gourmet Dakar',
    description: 'Le nom du restaurant à créer',
  })
  @IsString()
  @IsNotEmpty()
  restaurantName: string;
}
