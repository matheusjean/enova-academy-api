import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore as any,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      ttl: 30,
    }),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, PrismaService],
})
export class CoursesModule {}
