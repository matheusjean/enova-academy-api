import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ConfigService } from '@nestjs/config';

class ConfigServiceMock {
  getOrThrow<T = string>(_key: string): T {
    return 'test-secret' as unknown as T;
  }
}

describe('JwtStrategy', () => {
  it('validate() should map/return payload', async () => {
    const cfg = new ConfigServiceMock() as unknown as ConfigService;
    const strat = new JwtStrategy(cfg);

    const payload = { sub: 'u1', email: 'a@a', role: 'student' } as any;
    const res = await strat.validate(payload);

    expect(res).toHaveProperty('sub', 'u1');
    expect(res).toHaveProperty('email', 'a@a');
    expect(res).toHaveProperty('role', 'student');
  });
});
