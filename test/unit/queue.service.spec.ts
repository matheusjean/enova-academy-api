import { QueueService } from '../../src/queue/queue.service';
import { AmqpConnectionMock } from '../mocks/amqp';
import queueConfig from '../../src/config/queue.config';
import { ConfigType } from '@nestjs/config';
import { MetricsServiceMock } from '../mocks/metrics.service';
import { MetricsService } from '../../src/metrics/metrics.service';

describe('QueueService', () => {
  const cfg: ConfigType<typeof queueConfig> = {
    url: 'amqp://localhost',
    exchange: 'enova.exchange',
    paymentKey: 'payment.requested',
    welcomeKey: 'welcome.email',
  };

  it('publishes payment_requested event', async () => {
    const amqp = new AmqpConnectionMock();
    const svc = new QueueService(
      amqp as any,
      cfg as any,
      new MetricsServiceMock() as unknown as MetricsService,
    );
    await svc.publishPaymentRequested({
      enrollment_id: 'e1',
      course_id: 'c1',
      student_id: 'u1',
    });
    expect(amqp.publish).toHaveBeenCalledWith(
      'enova.exchange',
      'payment.requested',
      { enrollment_id: 'e1', course_id: 'c1', student_id: 'u1' },
    );
  });
});
