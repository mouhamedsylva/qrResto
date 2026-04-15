import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SubscribeDto } from './dto/subscribe.dto';
import { ChangePlanDto } from './dto/change-plan.dto';


@ApiTags('Abonnements')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: "Lister les plans d'abonnement disponibles" })
  @ApiResponse({
    status: 200,
    description: 'Liste des plans récupérée.',
    schema: {
      example: [
        { id: 'price_1', name: 'Plan Basique', price: 9.99, currency: 'EUR' },
        { id: 'price_2', name: 'Plan Premium', price: 29.99, currency: 'EUR' },
      ],
    },
  })
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Post('subscribe')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: "S'abonner à un plan" })
  @ApiBody({ type: SubscribeDto })
  @ApiResponse({
    status: 200,
    description: 'Session de paiement créée.',
    schema: {
      example: { url: 'https://checkout.stripe.com/pay/...' },
    },
  })
  async subscribe(@Request() req: any, @Body() subscribeDto: SubscribeDto) {
    return this.subscriptionsService.createSubscription(
      req.user.restaurantId,
      subscribeDto.priceId,
    );
  }

  @Put('change-plan')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Changer de plan d\'abonnement' })
  @ApiBody({ type: ChangePlanDto })
  async changePlan(@Request() req: any, @Body() dto: ChangePlanDto) {
    return this.subscriptionsService.changePlan(
      req.user.restaurantId,
      dto.newPlanId,
    );
  }
}

