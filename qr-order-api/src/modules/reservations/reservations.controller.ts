import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
  ApiQuery,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Réservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une réservation' })
  @ApiResponse({ status: 201, description: 'Réservation créée.' })
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les réservations' })
  @ApiQuery({ name: 'restaurantId', required: true })
  @ApiQuery({ name: 'date', required: false, example: '2026-04-20' })
  @ApiResponse({ status: 200, description: 'Liste des réservations.' })
  findAll(
    @Query('restaurantId') restaurantId: string,
    @Query('date') date?: string,
  ) {
    return this.reservationsService.findAll(restaurantId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une réservation' })
  @ApiResponse({ status: 200, description: 'Réservation trouvée.' })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour une réservation' })
  @ApiResponse({ status: 200, description: 'Réservation mise à jour.' })
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une réservation' })
  @ApiResponse({ status: 200, description: 'Réservation supprimée.' })
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }

  @Put(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Confirmer une réservation' })
  @ApiResponse({ status: 200, description: 'Réservation confirmée.' })
  confirm(@Param('id') id: string) {
    return this.reservationsService.confirm(id);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Annuler une réservation' })
  @ApiResponse({ status: 200, description: 'Réservation annulée.' })
  cancel(@Param('id') id: string) {
    return this.reservationsService.cancel(id);
  }

  @Put(':id/no-show')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Marquer comme no-show' })
  @ApiResponse({ status: 200, description: 'Réservation marquée no-show.' })
  markAsNoShow(@Param('id') id: string) {
    return this.reservationsService.markAsNoShow(id);
  }

  @Put(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Marquer comme complétée' })
  @ApiResponse({ status: 200, description: 'Réservation complétée.' })
  complete(@Param('id') id: string) {
    return this.reservationsService.complete(id);
  }
}
