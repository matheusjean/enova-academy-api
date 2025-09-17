import { QueueConsumer } from '../../src/queue/queue.consumer';

class EnrollmentsMock {
  markPaid = jest.fn().mockResolvedValue({ id: 'e1', status: 'paid' });
}
class EmailMock {
  logWelcome = jest.fn();
}
class QueueMock {
  publishWelcomeEmail = jest.fn().mockResolvedValue(undefined);
}

describe('QueueConsumer', () => {
  const payload = { enrollment_id: 'e1' };

  it('ignores when APP_WORKER != true', async () => {
    process.env.APP_WORKER = 'false';
    const c = new QueueConsumer(
      new EnrollmentsMock() as any,
      new EmailMock() as any,
      new QueueMock() as any,
    );
    await c.handlePaymentRequested(payload as any);
    expect((c as any).enrollments.markPaid).not.toHaveBeenCalled();
  });

  it('processes when APP_WORKER = true', async () => {
    process.env.APP_WORKER = 'true';
    const c = new QueueConsumer(
      new EnrollmentsMock() as any,
      new EmailMock() as any,
      new QueueMock() as any,
    );
    const orig = global.setTimeout;
    jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((fn: any) => (fn(), 0) as any);
    await c.handlePaymentRequested(payload as any);
    expect((c as any).enrollments.markPaid).toHaveBeenCalledWith('e1');
    (global.setTimeout as any).mockRestore?.();
    global.setTimeout = orig;
  });
});
