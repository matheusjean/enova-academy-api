import { RolesGuard } from 'src/common/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';

function mockCtx(user: any, path = '/x'): ExecutionContext {
  return {
    getHandler: () => ({}) as any,
    getClass: () => class {} as any,

    switchToHttp: () => ({
      getRequest: () => ({ user, route: { path } }),
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows when user has required role', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['admin']),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const can = await guard.canActivate(mockCtx({ role: 'admin' }));
    expect(can).toBe(true);
  });

  it('denies when user lacks role', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['admin']),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const can = await guard.canActivate(mockCtx({ role: 'student' }));
    expect(can).toBe(false);
  });

  it('passes through when no roles metadata', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const can = await guard.canActivate(mockCtx({ role: 'student' }));
    expect(can).toBe(true);
  });
});
