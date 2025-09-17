import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

type JwtUser = { sub: string; role: 'student' | 'admin'; email: string };

@UseGuards(JwtAuthGuard)
@Controller()
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Post('enrollments')
  async create(
    @CurrentUser() user: JwtUser,
    @Body() body: { course_id: string },
  ) {
    const sub = String(user.sub);
    const courseId = String(body.course_id);
    return this.service.createEnrollment({ sub, role: user.role }, courseId);
  }

  @Get('students/me/enrollments')
  listMine(@CurrentUser() user: JwtUser) {
    return this.service.listByStudent({
      sub: String(user.sub),
      role: user.role,
    });
  }

  @Get('students/:id/enrollments')
  listById(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.listByStudent(
      { sub: String(user.sub), role: user.role },
      String(id),
    );
  }

  @Delete('enrollments/:id')
  cancel(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.cancelEnrollment(
      { sub: String(user.sub), role: user.role },
      String(id),
    );
  }
}
