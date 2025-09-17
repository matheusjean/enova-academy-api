import { Module, forwardRef } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [forwardRef(() => EnrollmentsModule), QueueModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
