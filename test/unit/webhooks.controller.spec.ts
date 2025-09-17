import { WebhooksController } from '../../src/webhooks/webhooks.controller';

class EnrollmentsMock {
  markPaid = jest.fn().mockResolvedValue({ id: 'e1', status: 'paid' });
}
class QueueMock {
  publishWelcomeEmail = jest.fn().mockResolvedValue(undefined);
}

describe('WebhooksController', () => {
  it('rejects when APP_USE_WEBHOOK!=true', async () => {
    process.env.APP_USE_WEBHOOK = 'false';
    const c = new WebhooksController(
      new EnrollmentsMock() as any,
      new QueueMock() as any,
    );
    const res = await c.payment({ enrollment_id: 'e1', status: 'paid' } as any);
    expect(res.ok).toBe(false);
  });

  it('marks paid when enabled', async () => {
    process.env.APP_USE_WEBHOOK = 'true';
    const e = new EnrollmentsMock();
    const q = new QueueMock();
    const c = new WebhooksController(e as any, q as any);
    const res = await c.payment({ enrollment_id: 'e1', status: 'paid' } as any);
    expect(res.ok).toBe(true);
    expect(e.markPaid).toHaveBeenCalledWith('e1');
  });
});
