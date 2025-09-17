import { EnrollmentsService } from '../../src/enrollments/enrollments.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { QueueService } from '../../src/queue/queue.service';
import { PrismaServiceMock } from '../mocks/prisma.service';

class QueueServiceMock {
  publishPaymentRequested = jest.fn().mockResolvedValue(undefined);
}

const student = { sub: 'u1', role: 'student' };

describe('EnrollmentsService', () => {
  let prisma: PrismaServiceMock;
  let queue: QueueServiceMock;
  let service: EnrollmentsService;

  beforeEach(() => {
    prisma = new PrismaServiceMock();
    queue = new QueueServiceMock();
    service = new EnrollmentsService(
      prisma as unknown as PrismaService,
      queue as unknown as QueueService,
    );
  });

  it('should block duplicate enrollment', async () => {
    prisma.course.findUnique.mockResolvedValue({ id: 'c1', capacity: null });
    prisma.enrollment.findUnique.mockResolvedValue({ id: 'e1' });
    await expect(
      service.createEnrollment(student as any, 'c1'),
    ).rejects.toThrow('Already enrolled');
  });

  it('should block when capacity is full', async () => {
    prisma.course.findUnique.mockResolvedValue({ id: 'c1', capacity: 1 });
    prisma.enrollment.findUnique.mockResolvedValue(null);
    prisma.enrollment.count.mockResolvedValue(1);
    await expect(
      service.createEnrollment(student as any, 'c1'),
    ).rejects.toThrow('Course is full');
  });

  it('should create with pending_payment and publish event', async () => {
    prisma.course.findUnique.mockResolvedValue({ id: 'c1', capacity: null });
    prisma.enrollment.findUnique.mockResolvedValue(null);
    prisma.enrollment.create.mockResolvedValue({
      id: 'e1',
      studentId: 'u1',
      courseId: 'c1',
      status: 'pending_payment',
    });

    const created = await service.createEnrollment(student as any, 'c1');
    expect(created.status).toBe('pending_payment');
    expect(queue.publishPaymentRequested).toHaveBeenCalledWith({
      enrollment_id: 'e1',
      course_id: 'c1',
      student_id: 'u1',
    });
  });

  it('should cancel only pending_payment and owner/admin', async () => {
    prisma.enrollment.findUnique.mockResolvedValue({
      id: 'e1',
      studentId: 'u1',
      status: 'pending_payment',
    });
    prisma.enrollment.update.mockResolvedValue({
      id: 'e1',
      status: 'cancelled',
    });
    const res = await service.cancelEnrollment(student as any, 'e1');
    expect(res.status).toBe('cancelled');
  });
});
