import { Module, forwardRef } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { QueueConsumer } from './queue.consumer';
import queueConfig from '../config/queue.config';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { QueueModule } from './queue.module';

@Module({
  imports: [
    ConfigModule.forFeature(queueConfig),
    forwardRef(() => EnrollmentsModule),
    QueueModule,
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
  providers: [QueueConsumer],
})
export class QueueWorkerModule {}
