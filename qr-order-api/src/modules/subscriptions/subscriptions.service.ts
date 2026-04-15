import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  private stripe: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('STRIPE_API_KEY');
    if (!apiKey) throw new Error('STRIPE_API_KEY is not defined');
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-01-27-preview.acacia' as any,
    });
  }

  async createSubscription(restaurantId: string, priceId: string) {
    return { message: 'Subscription logic to be implemented with Stripe' };
  }

  async getPlans() {
    return [
      { id: 'basic_plan', name: 'Basic', price: 19.99, currency: 'EUR' },
      { id: 'pro_plan', name: 'Pro', price: 49.99, currency: 'EUR' },
    ];
  }

  async changePlan(restaurantId: string, planId: string) {
    return {
      message: `Plan changed to ${planId} for restaurant ${restaurantId}`,
    };
  }
}

