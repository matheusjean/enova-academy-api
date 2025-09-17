import { Injectable, Logger, Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import queueConfig from '../config/queue.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    private readonly amqp: AmqpConnection,
    @Inject(queueConfig.KEY)
    private readonly cfg: ConfigType<typeof queueConfig>,
  ) {}

  async publishPaymentRequested(payload: {
    enrollment_id: string;
    course_id: string;
    student_id: string;
  }) {
    await this.amqp.publish(this.cfg.exchange, this.cfg.paymentKey, payload);
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
