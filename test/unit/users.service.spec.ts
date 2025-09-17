import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';

class PrismaMock {
  user = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };
  $transaction = jest.fn((fns: any[]) => Promise.all(fns));
}

describe('UsersService', () => {
  let prisma: PrismaMock;
  let svc: UsersService;

  beforeEach(() => {
    prisma = new PrismaMock();
    svc = new UsersService(prisma as unknown as PrismaService);
  });

  it('findById returns user or throws', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    await expect(svc.findById('u1')).resolves.toEqual({ id: 'u1' });

    prisma.user.findUnique.mockResolvedValue(null);
    await expect(svc.findById('nope')).rejects.toThrow('User not found');
  });

  it('list returns paginated result', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'u1' }]);
    prisma.user.count.mockResolvedValue(1);
    const res = await svc.list(2, 5);
    expect(res.page).toBe(2);
    expect(res.limit).toBe(5);
    expect(res.items).toHaveLength(1);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
