import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({ example: '01', description: 'Numero/nom de table' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({
    example: 'TBL-01',
    required: false,
    description: 'Code court unique (sinon genere automatiquement)',
  })
  @IsString()
  @IsOptional()
  shortCode?: string;
}
