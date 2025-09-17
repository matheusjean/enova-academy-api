import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import dbConfig from './config/db.config';
import cacheConfig from './config/cache.config';
import queueConfig from './config/queue.config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { QueueModule } from './queue/queue.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, dbConfig, cacheConfig, queueConfig],
    }),

    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.APP_RATE_LIMIT_TTL ?? '60', 10),
        limit: parseInt(process.env.APP_RATE_LIMIT_LIMIT ?? '5', 10),
      },
    ]),

    AuthModule,
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    WebhooksModule,
    QueueModule,
    HealthModule,
    MetricsModule,
  ],
  providers: [PrismaService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
