import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions, PermissionType } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}


  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer un nouveau restaurant (Admin uniquement)' })
  @ApiBody({ type: CreateRestaurantDto })
  @ApiResponse({ status: 201, description: 'Restaurant créé.' })
  async create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les restaurants' })
  @ApiResponse({
    status: 200,
    description: 'Liste des restaurants récupérée.',
    schema: {
      example: [
        {
          id: 'uuid-1',
          name: 'Le Gourmet',
          address: '123 Rue de la Paix',
          phone: '0123456789',
        },
      ],
    },
  })
  async findAll() {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Obtenir les détails d'un restaurant" })
  @ApiResponse({
    status: 200,
    description: 'Détails du restaurant avec menus et tables.',
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Le Gourmet',
        categories: [{ id: 'cat-1', name: 'Entrées' }],
      },
    },
  })
  async findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour un restaurant' })
  @ApiBody({ type: UpdateRestaurantDto })
  async update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, updateRestaurantDto);
  }

  @Post(':id/logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour le logo du restaurant' })
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.restaurantsService.updateLogo(id, file);
  }

  @Get(':id/qr/:tableId')
  @ApiOperation({ summary: 'Générer un QR Code pour une table' })
  async getQRCode(@Param('id') id: string, @Param('tableId') tableId: string) {
    return this.restaurantsService.generateQRCode(id, tableId);
  }

  @Put(':id/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour les paramètres du restaurant' })
  @ApiBody({ type: UpdateSettingsDto })
  @ApiResponse({ status: 200, description: 'Paramètres mis à jour.' })
  async updateSettings(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.restaurantsService.updateSettings(id, updateSettingsDto);
  }

  @Get(':id/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Recuperer les parametres du restaurant' })
  @ApiResponse({ status: 200, description: 'Parametres recuperes.' })
  async getSettings(@Param('id') id: string) {
    return this.restaurantsService.getSettings(id);
  }

  @Get(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Recuperer le restaurant avec tous ses parametres' })
  @ApiResponse({ status: 200, description: 'Restaurant et parametres recuperes.' })
  async getRestaurantWithSettings(@Param('id') id: string) {
    return this.restaurantsService.getRestaurantWithSettings(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Permissions(PermissionType.SEE_STATS)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir les statistiques du tableau de bord' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées.' })
  async getStats(@Param('id') id: string) {
    return this.restaurantsService.getDashboardStats(id);
  }

  @Get(':id/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Permissions(PermissionType.SEE_STATS)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Obtenir les donnees du dashboard (stats, tendances, commandes, plan de salle)',
  })
  @ApiResponse({ status: 200, description: 'Donnees dashboard recuperees.' })
  async getDashboardOverview(@Param('id') id: string) {
    return this.restaurantsService.getDashboardOverview(id);
  }
}

