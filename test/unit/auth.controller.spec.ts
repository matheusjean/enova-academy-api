import { AuthController } from '../../src/auth/auth.controller';

class AuthServiceMock {
  signup = jest.fn().mockResolvedValue({ access_token: 't' });
  login = jest.fn().mockResolvedValue({ access_token: 't' });
}

describe('AuthController', () => {
  const svc = new AuthServiceMock();
  const c = new AuthController(svc as any);

  it('signup delegates', async () => {
    const res = await c.signup({
      email: 'a@a',
      name: 'A',
      password: '123456',
    } as any);
    expect(res.access_token).toBe('t');
    expect(svc.signup).toHaveBeenCalled();
  });

  it('login delegates', async () => {
    const res = await c.login({ email: 'a@a', password: '123456' } as any);
    expect(res.access_token).toBe('t');
    expect(svc.login).toHaveBeenCalled();
  });

  it('me returns payload', () => {
    const res = c.me({ sub: 'u1', email: 'a@a', role: 'student' } as any);
    expect(res.sub).toBe('u1');
  });
});
