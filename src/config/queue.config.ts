import { registerAs } from '@nestjs/config';
export default registerAs('queue', () => ({
  url: process.env.RABBIT_URL!,
  exchange: process.env.RABBIT_EXCHANGE ?? 'enova.exchange',
  paymentKey: process.env.RABBIT_PAYMENT_REQUESTED_ROUTING_KEY ?? 'payment.requested',
  welcomeKey: process.env.RABBIT_WELCOME_EMAIL_ROUTING_KEY ?? 'welcome.email',
}));