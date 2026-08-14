import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { AccessTokenRevocationService } from './access-token-revocation.service';
import { JwtStrategy } from './jwt.strategy';

const validPayload = {
  sub: 1,
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  phoneNumber: '09120000000',
  permissions: ['audio.read'],
  iat: Math.floor(Date.now() / 1000),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let accessTokenRevocationService: AccessTokenRevocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        AccessTokenRevocationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'jwt.secret') {
                return 'test-access-secret-min-32-characters!!';
              }

              return undefined;
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
    accessTokenRevocationService = module.get(AccessTokenRevocationService);
  });

  it('should_return_user_from_jwt_claims_without_repository', () => {
    const user = strategy.validate(validPayload);

    expect(user).toEqual({
      id: 1,
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phoneNumber: '09120000000',
      permissions: ['audio.read'],
    });
  });

  it('should_reject_when_required_claims_are_missing', () => {
    expect(() =>
      strategy.validate({
        ...validPayload,
        username: '',
      }),
    ).toThrow(UnauthorizedException);
  });

  it('should_reject_when_user_session_is_revoked', () => {
    accessTokenRevocationService.revokeUserSessions(1);

    expect(() =>
      strategy.validate({
        ...validPayload,
        iat: Math.floor(Date.now() / 1000) - 60,
      }),
    ).toThrow(UnauthorizedException);
  });

  it('should_accept_token_issued_after_revocation', () => {
    accessTokenRevocationService.revokeUserSessions(1);

    const user = strategy.validate({
      ...validPayload,
      iat: Math.floor(Date.now() / 1000) + 1,
    });

    expect(user.id).toBe(1);
  });
});
