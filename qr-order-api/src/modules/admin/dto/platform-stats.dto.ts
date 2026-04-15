import { ApiProperty } from '@nestjs/swagger';

export class PlatformStatsDto {
  @ApiProperty({ example: 150 })
  totalRestaurants: number;

  @ApiProperty({ example: 4500 })
  totalOrders: number;

  @ApiProperty({ example: 125000.5 })
  totalRevenue: number;

  @ApiProperty({ example: 1200 })
  totalUsers: number;
}
