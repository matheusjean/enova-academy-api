import { EmailService } from 'src/email/email.service';
import { Logger } from '@nestjs/common';

describe('EmailService', () => {
  it('logWelcome logs structured message', async () => {
    const svc = new EmailService();
    const spy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});

    await svc.logWelcome({ email: 'a@a', name: 'A', courseTitle: 'Node' });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('welcome_email => to=a@a'),
    );
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
