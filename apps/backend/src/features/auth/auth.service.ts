import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import { REFRESH_TOKEN_COOKIE, type IUserProfile } from '@helali/shared';

import { AuditLogsService } from '@/features/audit-logs/audit-logs.service';
import {
  AuthMessage,
  BadRequestMessage,
  PublicMessage,
} from '@/shared/constants/messages';
import { RedisService } from '@/shared/redis/redis.service';
import type {
  IAuthenticatedUser,
  IJwtPayload,
  IRefreshJwtPayload,
} from '@/shared/types/auth.types';

import { AuthRepository, type IUserAuthRecord } from './auth.repository';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { RefreshTokenRevocationService } from './refresh-token-revocation.service';

interface ILoginResult {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: IUserProfile;
}

@Injectable()
export class AuthService {
  private readonly refreshExpiresInDays = 30;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly auditLogsService: AuditLogsService,
    private readonly refreshTokenRevocationService: RefreshTokenRevocationService,
  ) {}

  async login(dto: LoginDto, ipAddress: string): Promise<ILoginResult> {
    await this.checkRateLimit(ipAddress);

    const user = await this.authRepository.findUserByUsername(dto.username);

    if (!user) {
      await this.incrementRateLimit(ipAddress);
      throw new UnauthorizedException(AuthMessage.InvalidCredentials);
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!isPasswordValid) {
      await this.incrementRateLimit(ipAddress);
      throw new UnauthorizedException(AuthMessage.InvalidCredentials);
    }

    await this.clearRateLimit(ipAddress);

    const profile = this.mapUserProfile(user);
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(profile);

    void this.auditLogsService.create({
      action: 'auth.login',
      entityType: 'User',
      entityId: String(user.id),
      userId: user.id,
      ipAddress,
      changes: { username: user.username },
    });

    return {
      accessToken,
      refreshToken,
      user: profile,
    };
  }

  async register(dto: RegisterDto): Promise<{ message: string }> {
    if (dto.password !== dto.confirmPassword) {
      throw new ConflictException(BadRequestMessage.PasswordMismatch);
    }

    const existingPhone = await this.authRepository.findUserByPhoneNumber(dto.phoneNumber);

    if (existingPhone) {
      throw new ConflictException(AuthMessage.UserAlreadyExists);
    }

    const existingUsername = await this.authRepository.findUserByUsername(dto.username);

    if (existingUsername) {
      throw new ConflictException(AuthMessage.UserAlreadyExists);
    }

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    const defaultRoleId = await this.authRepository.findDefaultUserRoleId();

    if (!defaultRoleId) {
      throw new ConflictException(BadRequestMessage.FailedUpdate);
    }

    await this.authRepository.createUser({
      username: dto.username,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      age: dto.age,
      email: dto.email,
      roleId: defaultRoleId,
    });

    return { message: PublicMessage.Registered };
  }

  async refresh(refreshToken: string): Promise<ILoginResult> {
    if (!refreshToken) {
      throw new UnauthorizedException(AuthMessage.RefreshTokenNotFound);
    }

    if (!this.isJwtRefreshToken(refreshToken)) {
      return this.refreshLegacyDbToken(refreshToken);
    }

    let payload: IRefreshJwtPayload;

    try {
      payload = this.jwtService.verify<IRefreshJwtPayload>(refreshToken, {
        secret: this.getRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException(AuthMessage.RefreshTokenInvalid);
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException(AuthMessage.RefreshTokenInvalid);
    }

    if (this.refreshTokenRevocationService.isRevoked(payload.jti)) {
      throw new UnauthorizedException(AuthMessage.RefreshTokenInvalid);
    }

    const user = await this.authRepository.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException(AuthMessage.AuthenticationRequired);
    }

    const profile = this.mapUserProfile(user);
    const accessToken = this.generateAccessTokenFromProfile(profile);
    const newRefreshToken = this.generateRefreshToken(profile);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: profile,
    };
  }

  async logout(
    refreshToken: string | undefined,
    userId?: number,
    ipAddress?: string,
  ): Promise<void> {
    if (refreshToken) {
      this.revokeRefreshToken(refreshToken);
    }

    if (userId !== undefined) {
      void this.auditLogsService.create({
        action: 'auth.logout',
        entityType: 'User',
        entityId: String(userId),
        userId,
        ipAddress: ipAddress ?? null,
      });
    }
  }

  getProfileFromAuthUser(user: IAuthenticatedUser): IUserProfile {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      roleId: user.roleId,
      role: user.role,
      permissions: [...user.permissions],
    };
  }

  async getProfile(userId: number): Promise<IUserProfile> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException(AuthMessage.AuthenticationRequired);
    }

    return this.mapUserProfile(user);
  }

  getRefreshTokenCookieName(): string {
    return REFRESH_TOKEN_COOKIE;
  }

  getRefreshTokenMaxAge(): number {
    return this.refreshExpiresInDays * 24 * 60 * 60 * 1000;
  }

  isCookieSecure(): boolean {
    return this.configService.get<boolean>('app.cookieSecure', false);
  }

  private async refreshLegacyDbToken(refreshToken: string): Promise<ILoginResult> {
    const storedToken = await this.authRepository.findRefreshTokenWithUser(refreshToken);

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException(AuthMessage.RefreshTokenInvalid);
    }

    const profile = this.mapUserProfile(storedToken.user);
    const accessToken = this.generateAccessToken(storedToken.user);
    const newRefreshToken = this.generateRefreshToken(profile);

    await this.authRepository.revokeRefreshToken(refreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: profile,
    };
  }

  private revokeRefreshToken(refreshToken: string): void {
    if (this.isJwtRefreshToken(refreshToken)) {
      const payload = this.decodeRefreshToken(refreshToken);

      if (payload?.jti) {
        const expiresAtMs = payload.exp
          ? payload.exp * 1000
          : Date.now() + this.getRefreshTokenMaxAge();
        this.refreshTokenRevocationService.revoke(payload.jti, expiresAtMs);
      }

      return;
    }

    void this.authRepository.revokeRefreshToken(refreshToken);
    void this.blacklistToken(refreshToken);
  }

  private generateAccessToken(user: IUserAuthRecord): string {
    return this.generateAccessTokenFromProfile(this.mapUserProfile(user));
  }

  private generateAccessTokenFromProfile(profile: IUserProfile): string {
    const permissions = [...(profile.permissions ?? [])];
    const payload: IJwtPayload = {
      sub: profile.id,
      username: profile.username,
      roleId: profile.roleId,
      role: profile.role,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
      permissions,
    };

    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(profile: IUserProfile): string {
    const payload = {
      sub: profile.id,
      username: profile.username,
      roleId: profile.roleId,
      role: profile.role,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
      permissions: [...(profile.permissions ?? [])],
      jti: uuidv4(),
      type: 'refresh' as const,
    };

    return this.jwtService.sign(payload, {
      secret: this.getRefreshSecret(),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '30d'),
    });
  }

  private decodeRefreshToken(refreshToken: string): IRefreshJwtPayload | null {
    try {
      return this.jwtService.verify<IRefreshJwtPayload>(refreshToken, {
        secret: this.getRefreshSecret(),
        ignoreExpiration: true,
      });
    } catch {
      const decoded = this.jwtService.decode(refreshToken);

      if (!decoded || typeof decoded !== 'object') {
        return null;
      }

      return decoded as IRefreshJwtPayload;
    }
  }

  private isJwtRefreshToken(refreshToken: string): boolean {
    return refreshToken.startsWith('eyJ');
  }

  private getRefreshSecret(): string {
    const secret = this.configService.get<string>('jwt.refreshSecret');

    if (!secret) {
      throw new UnauthorizedException(AuthMessage.RefreshTokenInvalid);
    }

    return secret;
  }

  private mapUserProfile(user: IUserAuthRecord): IUserProfile {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      age: user.age,
      email: user.email,
      roleId: user.roleId,
      role: user.role.name,
      permissions: user.role.permissions.map((item) => item.permission.name),
    };
  }

  private isLoginRateLimitEnabled(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private async checkRateLimit(ipAddress: string): Promise<void> {
    if (!this.isLoginRateLimitEnabled()) {
      return;
    }

    try {
      const isReady = await this.redisService.ensureReady();

      if (!isReady) {
        return;
      }

      const key = `rate_limit:login:${ipAddress}`;
      const attempts = await this.redisService.getClient().get(key);
      const count = attempts ? parseInt(attempts, 10) : 0;

      if (count >= 5) {
        throw new UnauthorizedException(AuthMessage.TooManyLoginAttempts);
      }
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
    }
  }

  private async incrementRateLimit(ipAddress: string): Promise<void> {
    if (!this.isLoginRateLimitEnabled()) {
      return;
    }

    try {
      const isReady = await this.redisService.ensureReady();

      if (!isReady) {
        return;
      }

      const key = `rate_limit:login:${ipAddress}`;
      const client = this.redisService.getClient();
      const count = await client.incr(key);

      if (count === 1) {
        await client.expire(key, 900);
      }
    } catch {
      // Redis unavailable — do not block login on infrastructure failures
    }
  }

  private async clearRateLimit(ipAddress: string): Promise<void> {
    if (!this.isLoginRateLimitEnabled()) {
      return;
    }

    try {
      const isReady = await this.redisService.ensureReady();

      if (!isReady) {
        return;
      }

      await this.redisService.getClient().del(`rate_limit:login:${ipAddress}`);
    } catch {
      // best-effort cleanup
    }
  }

  private async blacklistToken(token: string): Promise<void> {
    try {
      const isReady = await this.redisService.ensureReady();

      if (!isReady) {
        return;
      }

      const ttl = this.refreshExpiresInDays * 24 * 60 * 60;
      await this.redisService.getClient().setex(`blacklist:refresh:${token}`, ttl, '1');
    } catch {
      // Legacy DB tokens only — best-effort blacklist
    }
  }
}
