import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { StripeBillingService } from './stripe-billing/stripe-billing.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, StripeBillingService],
})
export class SubscriptionsModule {}
