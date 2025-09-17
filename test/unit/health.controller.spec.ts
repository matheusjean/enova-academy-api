import { HealthController } from '../../src/health/health.controller';

describe('HealthController', () => {
  it('returns ok', () => {
    const c = new HealthController();
    expect(c.health()).toEqual({ status: 'ok' });
  });
});
