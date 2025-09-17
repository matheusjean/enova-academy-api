import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({ imports: [EnrollmentsModule], controllers: [WebhooksController] })
export class WebhooksModule {}
