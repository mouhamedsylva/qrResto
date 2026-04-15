import { IsArray, IsString, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ItemOrderDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  order: number;
}

export class ReorderItemsDto {
  @ApiProperty({ type: [ItemOrderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOrderDto)
  orders: ItemOrderDto[];
}
