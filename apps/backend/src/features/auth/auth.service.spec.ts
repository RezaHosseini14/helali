import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';

import { AuthMessage } from '@/shared/constants/messages';
import { RedisService } from '@/shared/redis/redis.service';

import { AuditLogsService } from '@/features/audit-logs/audit-logs.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { RefreshTokenRevocationService } from './refresh-token-revocation.service';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;
  let refreshTokenRevocationService: jest.Mocked<RefreshTokenRevocationService>;
  let redisClient: {
    get: jest.Mock;
    incr: jest.Mock;
    expire: jest.Mock;
    del: jest.Mock;
    setex: jest.Mock;
  };

  const mockUser = {
    id: 1,
    username: 'admin',
    passwordHash: '',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '09120000000',
    age: null,
    email: null,
    role: 'ADMIN' as const,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockUser.passwordHash = await argon2.hash('admin123', { type: argon2.argon2id });

    redisClient = {
      get: jest.fn().mockResolvedValue(null),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      del: jest.fn().mockResolvedValue(1),
      setex: jest.fn().mockResolvedValue('OK'),
    };

    authRepository = {
      findUserByUsername: jest.fn(),
      findUserByPhoneNumber: jest.fn(),
      findUserById: jest.fn(),
      createUser: jest.fn(),
      createRefreshToken: jest.fn().mockResolvedValue({}),
      findRefreshTokenWithUser: jest.fn(),
      rotateRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    refreshTokenRevocationService = {
      revoke: jest.fn(),
      isRevoked: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<RefreshTokenRevocationService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: authRepository },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload: { type?: string }, options?: { secret?: string }) => {
              if (options?.secret || payload.type === 'refresh') {
                return 'refresh-token-jwt';
              }

              return 'access-token';
            }),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: unknown) => {
              if (key === 'app.cookieSecure') return false;
              if (key === 'jwt.refreshSecret') return 'test-refresh-secret-min-32-characters';
              if (key === 'jwt.refreshExpiresIn') return '30d';
              return defaultValue;
            }),
          },
        },
        {
          provide: RedisService,
          useValue: {
            ensureReady: jest.fn().mockResolvedValue(true),
            isAvailable: jest.fn().mockReturnValue(true),
            isCircuitOpen: jest.fn().mockReturnValue(false),
            getClient: jest.fn().mockReturnValue(redisClient),
          },
        },
        {
          provide: AuditLogsService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: RefreshTokenRevocationService,
          useValue: refreshTokenRevocationService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should_login_with_valid_credentials', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      authRepository.findUserByUsername.mockResolvedValue(mockUser);

      const result = await service.login({ username: 'admin', password: 'admin123' }, '127.0.0.1');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token-jwt');
      expect(result.user.username).toBe('admin');
      expect(authRepository.createRefreshToken).not.toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalledWith('rate_limit:login:127.0.0.1');
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it('should_reject_login_when_password_is_invalid', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      authRepository.findUserByUsername.mockResolvedValue(mockUser);

      await expect(
        service.login({ username: 'admin', password: 'wrong-password' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(redisClient.incr).toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it('should_reject_login_when_rate_limit_is_exceeded', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      redisClient.get.mockResolvedValue('5');

      await expect(
        service.login({ username: 'admin', password: 'admin123' }, '127.0.0.1'),
      ).rejects.toThrow(AuthMessage.TooManyLoginAttempts);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it('should_skip_login_rate_limit_outside_production', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      redisClient.get.mockResolvedValue('5');
      authRepository.findUserByUsername.mockResolvedValue(mockUser);

      const result = await service.login({ username: 'admin', password: 'admin123' }, '127.0.0.1');

      expect(result.accessToken).toBe('access-token');
      expect(redisClient.get).not.toHaveBeenCalled();
      expect(redisClient.del).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it('should_refresh_when_jwt_refresh_token_is_valid', async () => {
    const jwtService = service['jwtService'] as JwtService;
    jest.spyOn(jwtService, 'verify').mockReturnValue({
      sub: 1,
      username: 'admin',
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '09120000000',
      permissions: ['users.read'],
      jti: 'jti-1',
      type: 'refresh',
    });

    const result = await service.refresh('eyJrefresh-token');

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token-jwt');
    expect(authRepository.findRefreshTokenWithUser).not.toHaveBeenCalled();
  });
});
