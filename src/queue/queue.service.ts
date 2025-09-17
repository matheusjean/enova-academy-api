import { Injectable, Logger, Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import queueConfig from '../config/queue.config';
import type { ConfigType } from '@nestjs/config';
import { MetricsService } from 'src/metrics/metrics.service';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    private readonly amqp: AmqpConnection,
    @Inject(queueConfig.KEY)
    private readonly cfg: ConfigType<typeof queueConfig>,
    private readonly metrics: MetricsService,
  ) {}

  async publishPaymentRequested(payload: {
    enrollment_id: string;
    course_id: string;
    student_id: string;
  }) {
    await this.amqp.publish(this.cfg.exchange, this.cfg.paymentKey, payload);
    this.metrics?.queuePublished.labels('payment_requested').inc();
    this.logger.log(`Published payment_requested: ${JSON.stringify(payload)}`);
  }

  async publishWelcomeEmail(payload: {
    email: string;
    name: string;
    courseTitle: string;
  }) {
    await this.amqp.publish(this.cfg.exchange, this.cfg.welcomeKey, payload);
    this.logger.log(`Published welcome_email: ${JSON.stringify(payload)}`);
  }
}
