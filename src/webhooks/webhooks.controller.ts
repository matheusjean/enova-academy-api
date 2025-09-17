import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private cfg: ConfigService,
    private enrollments: EnrollmentsService,
  ) {}

  @Post('payment')
  async payment(
    @Body() body: { enrollment_id: string; status: 'paid' | 'failed' },
  ) {
    const useWebhook = (process.env.APP_USE_WEBHOOK ?? 'false') === 'true';
    if (!useWebhook) return { ignored: true };
    if (body.status === 'paid')
      await this.enrollments.markPaid(body.enrollment_id);
    return { ok: true };
  }
}
