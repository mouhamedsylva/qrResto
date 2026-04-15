import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkCreateTablesDto {
  @ApiProperty({ example: 1, description: 'Le numéro de la première table' })
  @IsNumber()
  @Min(1)
  startNumber: number;

  @ApiProperty({ example: 10, description: 'Le nombre de tables à créer' })
  @IsNumber()
  @Min(1)
  count: number;

  @ApiProperty({
    example: 'TBL',
    required: false,
    description: 'Prefixe des codes courts (ex: TBL-1)',
  })
  @IsString()
  @IsOptional()
  shortCodePrefix?: string;
}
