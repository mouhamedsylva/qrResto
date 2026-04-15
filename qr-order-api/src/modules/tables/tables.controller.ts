import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { BulkCreateTablesDto } from './dto/bulk-create-tables.dto';

@ApiTags('Tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  private getRestaurantIdFromRequest(req: any): string {
    const restaurantId = req.user?.restaurantId || req.user?.restaurant?.id;
    if (!restaurantId) {
      throw new BadRequestException('Aucun restaurant associe a cet utilisateur');
    }
    return restaurantId;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une nouvelle table' })
  @ApiBody({ type: CreateTableDto })
  @ApiResponse({ status: 201, description: 'Table créée.' })
  async create(@Request() req: any, @Body() createTableDto: CreateTableDto) {
    const restaurantId = this.getRestaurantIdFromRequest(req);
    return this.tablesService.create(restaurantId, createTableDto);
  }

  @Post('restaurant/:restaurantId')
  @ApiOperation({
    summary: "Creer une table pour un restaurant (fallback sans auth)",
  })
  @ApiBody({ type: CreateTableDto })
  @ApiResponse({ status: 201, description: 'Table créée.' })
  async createForRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Body() createTableDto: CreateTableDto,
  ) {
    return this.tablesService.create(restaurantId, createTableDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Création en masse de tables' })
  @ApiBody({ type: BulkCreateTablesDto })
  @ApiResponse({ status: 201, description: 'Tables créées.' })
  async bulkCreate(@Request() req: any, @Body() bulkDto: BulkCreateTablesDto) {
    const restaurantId = this.getRestaurantIdFromRequest(req);
    return this.tablesService.bulkCreate(restaurantId, bulkDto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Lister mes tables (restaurant de l'utilisateur)" })
  @ApiResponse({ status: 200, description: 'Liste des tables récupérée.' })
  async findMyTables(@Request() req: any) {
    const restaurantId = this.getRestaurantIdFromRequest(req);
    return this.tablesService.findAllByRestaurant(restaurantId);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: "Lister les tables d'un restaurant" })
  @ApiResponse({
    status: 200,
    description: 'Liste des tables récupérée.',
    schema: {
      example: [
        {
          id: 'uuid-1',
          name: 'Table 1',
          capacity: 4,
          status: 'AVAILABLE',
          qrCodeUrl: '...',
        },
      ],
    },
  })
  async findAll(@Param('restaurantId') restaurantId: string) {
    return this.tablesService.findAllByRestaurant(restaurantId);
  }

  @Get(':id/qr')
  @ApiOperation({ summary: "Obtenir le QR code d'une table" })
  async getTableQr(@Param('id') id: string) {
    return this.tablesService.generateQrCode(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une table' })
  @ApiResponse({ status: 200, description: 'Table supprimée.' })
  async remove(@Param('id') id: string) {
    return this.tablesService.remove(id);
  }
}
