import { NestFactory } from '@nestjs/core';
import { QueueWorkerModule } from './queue.worker.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(QueueWorkerModule, {
    bufferLogs: true,
  });
  console.log('🚀 Worker started. Listening to RabbitMQ events...');
}
bootstrap();
