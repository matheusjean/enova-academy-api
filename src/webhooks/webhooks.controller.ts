import { BadRequestException, Controller, Post, Body } from '@nestjs/common';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { QueueService } from '../queue/queue.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly enrollments: EnrollmentsService,
    private readonly queue: QueueService,
  ) {}

  @Post('payment')
  async payment(
    @Body() body: { enrollment_id: string; status: 'paid' | 'failed' },
  ) {
    const useWebhook = (process.env.APP_USE_WEBHOOK ?? 'false') === 'true';

    if (!useWebhook)
      return { ok: false, msg: 'Webhook disabled (APP_USE_WEBHOOK!=true)' };

    if (!body?.enrollment_id)
      throw new BadRequestException('Missing enrollment_id');

    if (body.status === 'paid') {
      await this.enrollments.markPaid(body.enrollment_id);

      await this.queue.publishWelcomeEmail({
        email: 'student@local',
        name: 'Student',
        courseTitle: 'Course',
      });
    }

    return { ok: true };
  }
}
