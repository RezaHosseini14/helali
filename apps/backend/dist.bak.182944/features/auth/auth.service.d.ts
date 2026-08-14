import { JwtService } from '@nestjs/jwt';
import { type IUserProfile } from '@helali/shared';
import { AuditLogsService } from '@/features/audit-logs/audit-logs.service';
import { RedisService } from '@/shared/redis/redis.service';
import type { IAuthenticatedUser } from '@/shared/types/auth.types';
import { AuthRepository } from './auth.repository';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
interface ILoginResult {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly user: IUserProfile;
}
export declare class AuthService {
    private readonly authRepository;
    private readonly jwtService;
    private readonly redisService;
    private readonly auditLogsService;
    private readonly refreshExpiresInDays;
    constructor(authRepository: AuthRepository, jwtService: JwtService, redisService: RedisService, auditLogsService: AuditLogsService);
    login(dto: LoginDto, ipAddress: string): Promise<ILoginResult>;
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    refresh(refreshToken: string): Promise<ILoginResult>;
    logout(refreshToken: string | undefined, userId?: number, ipAddress?: string): Promise<void>;
    getProfileFromAuthUser(user: IAuthenticatedUser): IUserProfile;
    getProfile(userId: number): Promise<IUserProfile>;
    private issueTokens;
    private generateAccessToken;
    private mapUserProfile;
    private checkRateLimit;
    private incrementRateLimit;
    private clearRateLimit;
}
export {};
