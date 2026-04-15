import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  apiKey: process.env.STRIPE_API_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: process.env.STRIPE_CURRENCY || 'eur',
}));
