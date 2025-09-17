import { MetricsService } from '../../src/metrics/metrics.service';

describe('MetricsService', () => {
  it('initializes counters and histogram', () => {
    const m = new MetricsService();
    expect(m.httpRequestsTotal).toBeDefined();
    expect(m.httpRequestDurationSeconds).toBeDefined();
    expect(m.registry).toBeDefined();
  });

  it('exposes .metrics() via registry', async () => {
    const m = new MetricsService();
    const text = await m.registry.metrics();
    expect(typeof text).toBe('string');
  });
});
