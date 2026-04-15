import {
  Controller,
  Post,
  Headers,
  Req,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { StripeWebhookService } from './stripe-webhook/stripe-webhook.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { RefundDto } from './dto/refund.dto';
import type { Request } from 'express';

@ApiTags('Paiements')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeWebhookService: StripeWebhookService,
  ) {}


  @Post('checkout')
  @ApiOperation({ summary: 'Créer une session de paiement Stripe' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Session créée.' })
  async createCheckoutSession(@Body() createOrderDto: CreateOrderDto) {
    return this.paymentsService.createCheckoutSession(createOrderDto);
  }

  @Post('intent')
  @ApiOperation({ summary: 'Créer un PaymentIntent Stripe' })
  @ApiBody({ type: CreatePaymentIntentDto })
  async createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(dto);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirmer un paiement Stripe' })
  @ApiBody({ type: ConfirmPaymentDto })
  async confirm(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(dto);
  }

  @Post('refund')
  @ApiOperation({ summary: 'Rembourser un paiement' })
  @ApiBody({ type: RefundDto })
  async refund(@Body() dto: RefundDto) {
    return this.paymentsService.refund(dto);
  }


  @Post('webhook')
  @ApiOperation({ summary: 'Webhook Stripe pour les événements de paiement' })
  @ApiResponse({ status: 200, description: 'Webhook traité.' })
  @ApiResponse({ status: 400, description: 'Signature ou payload invalide.' })
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const payload = request.rawBody;
    if (!payload) {
      throw new BadRequestException('Missing raw body');
    }

    return this.stripeWebhookService.handleWebhook(signature, payload);
  }
}
