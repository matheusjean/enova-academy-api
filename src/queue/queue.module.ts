import { Module, forwardRef } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { QueueService } from './queue.service';
import queueConfig from '../config/queue.config';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { MetricsService } from 'src/metrics/metrics.service';
import { MetricsModule } from 'src/metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forFeature(queueConfig),
    MetricsModule,
    forwardRef(() => EnrollmentsModule),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule.forFeature(queueConfig)],
      inject: [queueConfig.KEY],
      useFactory: (cfg: ConfigType<typeof queueConfig>) => ({
        exchanges: [{ name: cfg.exchange, type: 'topic' }],
        uri: cfg.url,
        connectionInitOptions: { wait: true, timeout: 10000 },
        connectionManagerOptions: {
          heartbeatIntervalInSeconds: 15,
          reconnectTimeInSeconds: 5,
        },
      }),
    }),
    EmailModule,
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
