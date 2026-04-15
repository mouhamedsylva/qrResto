import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PlatformStatsDto } from './dto/platform-stats.dto';

@ApiTags('Administration')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Obtenir les statistiques globales de la plateforme',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées.',
    type: PlatformStatsDto,
  })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('restaurants')
  @ApiOperation({ summary: 'Lister tous les restaurants du système' })
  @ApiResponse({
    status: 200,
    description: 'Liste des restaurants récupérée.',
    schema: {
      example: [
        {
          id: 'uuid-1',
          name: 'Le resto',
          isActive: true,
          ownerEmail: 'owner@example.com',
        },
      ],
    },
  })
  async getAllRestaurants() {
    return this.adminService.getAllRestaurants();
  }

  @Put('restaurants/:id/active')
  @ApiOperation({ summary: 'Activer/Désactiver un restaurant' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        active: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Statut du restaurant mis à jour.' })
  async toggleRestaurantActive(
    @Param('id') id: string,
    @Body('active') active: boolean,
  ) {
    return this.adminService.toggleRestaurantActive(id, active);
  }
}
