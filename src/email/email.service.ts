import { Injectable, Logger } from '@nestjs/common';
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  logWelcome(data: { email: string; name: string; courseTitle: string }) {
    this.logger.log(
      `welcome_email => to=${data.email} name=${data.name} course=${data.courseTitle}`,
    );
  }
}
