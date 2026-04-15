import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsHexColor,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({ example: '#FF0000', required: false })
  @IsHexColor()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({ example: '#FFFFFF', required: false })
  @IsHexColor()
  @IsOptional()
  secondaryColor?: string;

  @ApiProperty({ example: 'EUR', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 'fr', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isOrderingEnabled?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isTaxIncluded?: boolean;

  @ApiProperty({ example: 20, required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  taxRate?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  staffCanEditMenu?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  staffCanManageOrders?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  managerCanEditMenu?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  managerCanManageOrders?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  managerCanSeeStats?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  managerCanManageStaff?: boolean;
}
