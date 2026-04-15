import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-order-item.dto';
import { OrderType } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({
    example: 'uuid-v4-restaurant-id',
    description: 'ID du restaurant',
  })
  @IsUUID()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({
    example: 'uuid-v4-table-id',
    description: 'ID de la table (facultatif si à emporter)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  tableId?: string;

  @ApiProperty({
    enum: OrderType,
    example: OrderType.DINE_IN,
    description: 'Type de commande (Sur place ou À emporter)',
  })
  @IsEnum(OrderType)
  @IsOptional()
  type?: OrderType = OrderType.DINE_IN;

  @ApiProperty({
    example: 'Jean Dupont',
    description: 'Nom du client (utile pour la vente à emporter)',
    required: false,
  })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Liste des articles commandés',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({
    example: "Sans oignons s'il vous plaît",
    description: 'Note pour la cuisine',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
