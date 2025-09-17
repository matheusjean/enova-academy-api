import { UsersController } from 'src/users/users.controller';

class UsersServiceMock {
  list = jest
    .fn()
    .mockResolvedValue({ items: [{ id: 'u1' }], total: 1, page: 1, limit: 10 });
  findById = jest.fn().mockResolvedValue({ id: 'u1', email: 'a@a' });
}

describe('UsersController', () => {
  let svc: UsersServiceMock;
  let ctrl: UsersController;

  beforeEach(() => {
    svc = new UsersServiceMock();
    ctrl = new UsersController(svc as any);
  });

  it('list delegates to service.list with pagination', async () => {
    const res = await ctrl.list(1 as any, 10 as any);
    expect(res.page).toBe(1);
    expect(svc.list).toHaveBeenCalledWith(1, 10);
  });

  it('get delegates to service.findById', async () => {
    const res = await ctrl.get('u1');
    expect(res.id).toBe('u1');
    expect(svc.findById).toHaveBeenCalledWith('u1');
  });
});
