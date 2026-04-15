import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import Stripe from 'stripe';
import {
  Order,
  PaymentStatus,
  OrderType,
} from '../orders/entities/order.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { Payment } from './entities/payment.entity';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { RefundDto } from './dto/refund.dto';

@Injectable()
export class PaymentsService {
  private stripe: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {

    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_API_KEY') || '',
      {
        apiVersion: '2023-10-16' as any, // Standard stable version
      },
    );
  }

  async createCheckoutSession(createOrderDto: CreateOrderDto) {
    const { items, restaurantId, tableId, note, type, customerName } =
      createOrderDto;

    // Fetch menu items to get verified prices
    const itemIds = items.map((i) => i.menuItemId);
    const menuItems = await this.menuItemRepository.find({
      where: { id: In(itemIds) },
    });

    if (menuItems.length !== itemIds.length) {
      throw new NotFoundException('One or more menu items not found');
    }

    const lineItems = items.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new NotFoundException(`Produit ${item.menuItemId} non trouvé`);
      }
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: menuItem.name,
            metadata: { menuItemId: menuItem.id }, // Still good to have
          },
          unit_amount: Math.round(Number(menuItem.price) * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${this.configService.get<string>('FRONTEND_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/cancel`,
      metadata: {
        restaurantId,
        tableId: tableId || '',
        type: type || OrderType.DINE_IN,
        customerName: customerName || '',
        note: note || '',
      },
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    // This logic will be moved to StripeWebhookService for better modularity
    const endpointSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret,
      );
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    // Temporary: Logic stays here until StripeWebhookService is wired up
    return { event };
  }

  async getSessionLineItems(sessionId: string) {
    return this.stripe.checkout.sessions.listLineItems(sessionId, {
      expand: ['data.price.product'],
    });
  }

  async getSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(dto.amount * 100),
      currency: dto.currency || 'eur',
      metadata: { orderId: dto.orderId },
    });

    return { clientSecret: intent.client_secret };
  }

  async confirmPayment(dto: ConfirmPaymentDto) {
    const intent = await this.stripe.paymentIntents.confirm(
      dto.paymentIntentId,
      { payment_method: dto.paymentMethodId },
    );

    return intent;
  }

  async refund(dto: RefundDto) {
    const refund = await this.stripe.refunds.create({
      payment_intent: dto.paymentId,
      amount: dto.amount ? Math.round(dto.amount * 100) : undefined,
      reason: dto.reason as any,
    });

    return refund;
  }
}

