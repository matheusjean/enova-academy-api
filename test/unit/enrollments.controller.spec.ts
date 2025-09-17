import { EnrollmentsController } from 'src/enrollments/enrollments.controller';

class ServiceMock {
  createEnrollment = jest.fn().mockResolvedValue({ id: 'e1' });
  listByStudent = jest.fn().mockResolvedValue([{ id: 'e1' }]);
  cancelEnrollment = jest
    .fn()
    .mockResolvedValue({ id: 'e1', status: 'cancelled' });
}

describe('EnrollmentsController', () => {
  const svc = new ServiceMock();
  const c = new EnrollmentsController(svc as any);

  const user = { sub: 'u1', role: 'student' } as any;

  it('create delegates', async () => {
    const res = await c.create(user, { course_id: 'c1' } as any);
    expect(res.id).toBe('e1');
    expect(svc.createEnrollment).toHaveBeenCalledWith(user, 'c1');
  });

  it('list mine', async () => {
    const res = await c.listMine(user);
    expect(Array.isArray(res)).toBe(true);
  });

  it('list by student id', async () => {
    const res = await c.listById(user, 'u1');
    expect(res[0].id).toBe('e1');
  });

  it('cancel delegates', async () => {
    const res = await c.cancel(user, 'e1');
    expect(res.status).toBe('cancelled');
  });
});
