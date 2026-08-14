import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CaslGuard } from './casl.guard';

describe('CaslGuard', () => {
  let guard: CaslGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new CaslGuard(reflector);
  });

  it('should_allow_route_without_ability_requirements', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createMockContext(undefined, { id: '1' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should_allow_admin_to_manage_audio', () => {
    reflector.getAllAndOverride.mockReturnValue([{ action: 'create', subject: 'Audio' }]);

    const context = createMockContext(
      {
        id: 1,
        role: 'ADMIN',
        permissions: ['audio.create'],
      },
      {},
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should_allow_self_user_update_with_field_requirement', () => {
    reflector.getAllAndOverride.mockReturnValue([
      { action: 'update', subject: 'User', field: 'id', param: 'id' },
    ]);

    const context = createMockContext(
      {
        id: 5,
        role: 'USER',
        permissions: ['audio.read'],
      },
      { id: '5' },
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should_reject_when_permissions_are_insufficient', () => {
    reflector.getAllAndOverride.mockReturnValue([{ action: 'manage', subject: 'User' }]);

    const context = createMockContext(
      {
        id: 2,
        role: 'ADMIN',
        permissions: ['audio.read'],
      },
      {},
    );

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

function createMockContext(
  user:
    | {
        id: number;
        role: string;
        permissions: string[];
      }
    | undefined,
  params: Record<string, string>,
): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user: user
          ? {
              ...user,
              username: 'user',
              firstName: 'First',
              lastName: 'Last',
              phoneNumber: '09120000000',
            }
          : undefined,
        params,
      }),
    }),
  } as unknown as ExecutionContext;
}
