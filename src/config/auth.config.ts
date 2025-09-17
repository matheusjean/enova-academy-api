import { registerAs } from '@nestjs/config';
export default registerAs('auth', () => ({
  jwtSecret: process.env.APP_JWT_SECRET!,
}));