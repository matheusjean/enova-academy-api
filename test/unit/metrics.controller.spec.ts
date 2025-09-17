import { MetricsController } from '../../src/metrics/metrics.controller';

describe('MetricsController', () => {
  it('returns metrics text', async () => {
    const c = new MetricsController({
      registry: { metrics: () => '# mock' },
    } as any);
    const res = await c.metrics();
    expect(res).toContain('# mock');
  });
});
