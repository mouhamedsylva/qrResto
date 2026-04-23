import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AnalyticsPeriod {
  TODAY = 'TODAY',
  LAST_7 = 'LAST_7',
  LAST_30 = 'LAST_30',
  CUSTOM = 'CUSTOM',
}

export enum OrderStatus {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PREPARING = 'PREPARING',
  PENDING = 'PENDING',
  READY = 'READY',
}

export class AnalyticsQueryDto {
  @ApiProperty({ enum: AnalyticsPeriod, default: AnalyticsPeriod.LAST_7 })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod = AnalyticsPeriod.LAST_7;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  channel?: string;
}
