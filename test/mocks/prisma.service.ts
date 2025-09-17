export class PrismaServiceMock {
  user = { findUnique: jest.fn(), create: jest.fn() };
  course = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  };
  enrollment = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  $transaction = jest.fn((fns: any[]) => Promise.all(fns));
}
