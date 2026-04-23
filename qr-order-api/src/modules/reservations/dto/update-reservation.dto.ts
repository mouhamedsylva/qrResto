import { PartialType } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../entities/reservation.entity';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @ApiProperty({
    example: 'CONFIRMED',
    description: 'Statut de la réservation',
    enum: ReservationStatus,
    required: false,
  })
  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;
}
