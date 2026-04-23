import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':restaurantId')
  @ApiOperation({
    summary: 'Obtenir les analytics pour un restaurant',
    description:
      'Retourne toutes les données analytiques : KPIs, graphiques, performances, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Données analytiques récupérées avec succès',
  })
  @ApiQuery({ name: 'period', required: false, enum: ['TODAY', 'LAST_7', 'LAST_30', 'CUSTOM'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['COMPLETED', 'CANCELLED', 'PREPARING', 'PENDING', 'READY'] })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'channel', required: false, type: String })
  async getAnalytics(
    @Param('restaurantId') restaurantId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getAnalytics(restaurantId, query);
  }
}
