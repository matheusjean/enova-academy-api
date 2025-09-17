import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

class PrismaMock {
  user = { findUnique: jest.fn(), create: jest.fn() };
}

describe('AuthService', () => {
  let prisma: PrismaMock;
  let svc: AuthService;

  const PHC =
    '$argon2id$v=19$m=65536,t=3,p=4$zXlVZWZk$Wm1d8k0b1s7f1g9cX+abc1234567890=';

  beforeEach(() => {
    prisma = new PrismaMock();

    (argon2.hash as jest.Mock).mockResolvedValue(PHC);
    (argon2.verify as jest.Mock).mockResolvedValue(true);

    const jwtServiceMock = { sign: jest.fn().mockReturnValue('token') } as any;
    svc = new AuthService(prisma as unknown as PrismaService, jwtServiceMock);
  });

  afterEach(() => jest.clearAllMocks());

  it('signup creates student by default and returns token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'a@a',
      role: 'student',
    });

    const res = await svc.signup({
      email: 'a@a',
      name: 'A',
      password: '123456',
    });

    expect(res.access_token).toBeDefined();
    expect(prisma.user.create).toHaveBeenCalledTimes(1);

    const arg = prisma.user.create.mock.calls[0][0];
    expect(arg.data.email).toBe('a@a');
    expect(typeof arg.data.password).toBe('string');
    expect(arg.data.password.startsWith('$argon2')).toBe(true);
  });

  it('login returns token when credentials ok', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@a',
      password: PHC,
      role: 'student',
    });
    (argon2.verify as jest.Mock).mockResolvedValue(true);

    const res = await svc.login({ email: 'a@a', password: '123456' });
    expect(res.access_token).toBeDefined();
  });

  it('login fails when user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      svc.login({ email: 'x@x', password: '123' }),
    ).rejects.toThrow();
  });

  it('login fails when password mismatch', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@a',
      password: PHC,
      role: 'student',
    });
    (argon2.verify as jest.Mock).mockResolvedValue(false);
    await expect(
      svc.login({ email: 'a@a', password: 'wrong' }),
    ).rejects.toThrow();
  });
});
