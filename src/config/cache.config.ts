import { registerAs } from '@nestjs/config';
export default registerAs('cache', () => ({
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  db: parseInt(process.env.REDIS_DB ?? '0', 10),
}));