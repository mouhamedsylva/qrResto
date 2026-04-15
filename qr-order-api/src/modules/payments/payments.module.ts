import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe/stripe.service';
import { StripeWebhookService } from './stripe-webhook/stripe-webhook.service';
import { Order } from '../orders/entities/order.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { Payment } from './entities/payment.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, MenuItem, Payment]), OrdersModule],

  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService, StripeWebhookService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
