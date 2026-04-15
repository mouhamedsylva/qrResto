import { Injectable, Logger } from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { OrdersService } from '../../orders/orders.service';
import { PaymentStatus } from '../../orders/entities/order.entity';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  async handleWebhook(signature: string, payload: Buffer) {
    let event;
    try {
      const result = await this.paymentsService.handleWebhook(
        signature,
        payload,
      );
      event = result.event;
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw err;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await this.createOrderFromSession(session);
    }

    return { received: true };
  }

  private async createOrderFromSession(session: any) {
    const sessionId = session.id;
    const { restaurantId, tableId, note, type, customerName } =
      session.metadata;

    // Retrieve full line items from Stripe to get items details
    const lineItems = await this.paymentsService.getSessionLineItems(sessionId);

    const items = await Promise.all(
      lineItems.data.map(async (li: any) => {
        return {
          menuItemId: li.price.product.metadata.menuItemId || li.description,
          quantity: li.quantity,
          priceAtOrder: li.amount_total / li.quantity / 100,
        };
      }),
    );

    const orderDto = {
      restaurantId,
      tableId: tableId || null,
      type: type || null,
      customerName: customerName || null,
      items,
      note,
      paymentStatus: PaymentStatus.PAID,
      stripeSessionId: sessionId,
      totalPrice: session.amount_total / 100,
    };

    try {
      await this.ordersService.create(orderDto);
      this.logger.log(`Order created successfully for session ${sessionId}`);
    } catch (err) {
      this.logger.error(
        `Failed to create order for session ${sessionId}: ${err.message}`,
      );
      // In production, you'd want to handle this (e.g. retry or alert)
    }
  }
}
