import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
  ) {}

  async createEnrollment(
    user: { sub: string; role: string },
    courseId: string,
  ) {
    const studentId = user.sub;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const dup = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (dup) {
      throw new ConflictException('Student already enrolled in this course');
    }

    if (course.capacity) {
      const count = await this.prisma.enrollment.count({
        where: { courseId, status: { not: 'cancelled' } },
      });
      if (count >= course.capacity) {
        throw new UnprocessableEntityException(
          `Course "${course.title}" is full`,
        );
      }
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        status: 'pending_payment',
      },
    });

    await this.queue.publishPaymentRequested({
      enrollment_id: enrollment.id,
      course_id: courseId,
      student_id: studentId,
    });

    return enrollment;
  }

  async listByStudent(
    requester: { sub: string; role: string },
    studentId?: string,
  ) {
    const id = studentId ?? requester.sub;

    if (requester.role !== 'admin' && id !== requester.sub) {
      throw new ForbiddenException();
    }

    return this.prisma.enrollment.findMany({
      where: { studentId: id },
      include: { course: true },
    });
  }

  async cancelEnrollment(
    requester: { sub: string; role: string },
    enrollmentId: string,
  ) {
    const enroll = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!enroll) throw new NotFoundException();

    if (requester.role !== 'admin' && enroll.studentId !== requester.sub) {
      throw new ForbiddenException();
    }

    if (enroll.status !== 'pending_payment') {
      throw new BadRequestException('Only pending_payment can be cancelled');
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'cancelled' },
    });
  }

  async markPaid(enrollmentId: string) {
    const enroll = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    });
    if (!enroll) throw new NotFoundException();

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'paid' },
    });
  }
}
