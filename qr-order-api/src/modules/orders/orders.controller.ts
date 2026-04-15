import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions, PermissionType } from '../auth/decorators/permissions.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';

@ApiTags('Commandes')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Permissions(PermissionType.SEE_STATS)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lister et filtrer toutes les commandes' })
  async findAll(@Query() filter: FilterOrdersDto) {
    return this.ordersService.findAll(filter);
  }


  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle commande' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Commande créée.' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get('restaurant/:restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @Permissions(PermissionType.MANAGE_ORDERS)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Lister les commandes d'un restaurant" })
  @ApiResponse({
    status: 200,
    description: 'Liste des commandes récupérée.',
    schema: {
      example: [
        {
          id: 'uuid-1',
          status: 'PENDING',
          totalAmount: 35.5,
          table: { number: '5' },
          items: [{ name: 'Burger', quantity: 2 }],
        },
      ],
    },
  })
  async findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.findByRestaurant(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Obtenir les détails d'une commande" })
  @ApiResponse({
    status: 200,
    description: 'Détails de la commande.',
    schema: {
      example: {
        id: 'uuid-1',
        status: 'PENDING',
        totalAmount: 35.5,
        items: [{ name: 'Burger', quantity: 2 }],
      },
    },
  })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @Permissions(PermissionType.MANAGE_ORDERS)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Mettre à jour le statut d'une commande" })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Statut mis à jour.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto.status);
  }
}
