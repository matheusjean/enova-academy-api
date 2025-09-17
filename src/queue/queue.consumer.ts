import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe, RabbitPayload } from '@golevelup/nestjs-rabbitmq';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { EmailService } from '../email/email.service';
import { QueueService } from './queue.service';

@Injectable()
export class QueueConsumer {
  private readonly logger = new Logger(QueueConsumer.name);
  private readonly isWorker = (process.env.APP_WORKER ?? 'false') === 'true';

  constructor(
    private readonly enrollments: EnrollmentsService,
    private readonly email: EmailService,
    private readonly queue: QueueService,
  ) {}

  @RabbitSubscribe({
    exchange: process.env.RABBIT_EXCHANGE!,
    routingKey: process.env.RABBIT_PAYMENT_REQUESTED_ROUTING_KEY!,
    queue: 'payment_requested.queue',
  })
  async handlePaymentRequested(
    @RabbitPayload() payload: { enrollment_id: string },
  ) {
    if (!this.isWorker) {
      this.logger.warn('APP_WORKER!=true — consumer desativado neste processo');
      return;
    }
    this.logger.log(`Consuming payment_requested: ${JSON.stringify(payload)}`);
    await new Promise((r) =>
      setTimeout(r, 3000 + Math.floor(Math.random() * 2000)),
    );
    await this.enrollments.markPaid(payload.enrollment_id);

    await this.queue.publishWelcomeEmail({
      email: 'student@local',
      name: 'Student',
      courseTitle: 'Course',
    });
    this.email.logWelcome({
      email: 'student@local',
      name: 'Student',
      courseTitle: 'Course',
    });
  }
}
