import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({
    example: 'uuid-v4-menu-item-id',
    description: 'ID du plat commandé',
  })
  @IsUUID()
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantité',
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}
