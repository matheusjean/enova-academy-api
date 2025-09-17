import { CoursesController } from 'src/courses/courses.controller';

class CoursesServiceMock {
  create = jest.fn().mockResolvedValue({ id: 'c1' });
  list = jest
    .fn()
    .mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 });
  getByIdOrSlug = jest.fn().mockResolvedValue({ id: 'c1' });
}

describe('CoursesController', () => {
  const svc = new CoursesServiceMock();
  const c = new CoursesController(svc as any);

  it('create delegates', async () => {
    const res = await c.create({
      title: 'T',
      slug: 's',
      price_cents: 100,
    } as any);
    expect(res.id).toBe('c1');
  });

  it('list delegates with query', async () => {
    const res = await c.list({ page: 1, limit: 10, q: 'q' } as any);
    expect(res.page).toBe(1);
    expect(svc.list).toHaveBeenCalled();
  });

  it('detail delegates', async () => {
    const res = await c.detail('c1');
    expect(res).not.toBeNull();
    if (res) {
      expect(res.id).toBe('c1');
    }
  });
});
