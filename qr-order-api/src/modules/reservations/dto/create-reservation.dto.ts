import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEmail,
  IsDateString,
  Min,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({
    example: 'Awa Sow',
    description: 'Nom du client',
  })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({
    example: '+33612345678',
    description: 'Téléphone du client',
  })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({
    example: 'awa.sow@example.com',
    description: 'Email du client (optionnel)',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({
    example: 4,
    description: 'Nombre de personnes',
  })
  @IsNumber()
  @Min(1)
  partySize: number;

  @ApiProperty({
    example: '2026-04-20',
    description: 'Date de la réservation (YYYY-MM-DD)',
  })
  @IsDateString()
  reservationDate: string;

  @ApiProperty({
    example: '19:00',
    description: 'Heure de la réservation (HH:mm)',
  })
  @IsString()
  @IsNotEmpty()
  reservationTime: string;

  @ApiProperty({
    example: 'uuid-table-id',
    description: 'ID de la table (optionnel)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  tableId?: string;

  @ApiProperty({
    example: 'Anniversaire - prévoir bougie',
    description: 'Notes spéciales (optionnel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: 'uuid-restaurant-id',
    description: 'ID du restaurant',
  })
  @IsUUID()
  @IsNotEmpty()
  restaurantId: string;
}
