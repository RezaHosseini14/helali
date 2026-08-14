import { type IPaginatedResponse, type IUser } from '@helali/shared';
import type { IAuthenticatedUser } from '@/shared/types/auth.types';
import { AccessTokenRevocationService } from '@/features/auth/access-token-revocation.service';
import { AuthRepository } from '@/features/auth/auth.repository';
import { AuditLogsService } from '@/features/audit-logs/audit-logs.service';
import type { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
export declare class UsersService {
    private readonly usersRepository;
    private readonly authRepository;
    private readonly accessTokenRevocationService;
    private readonly auditLogsService;
    constructor(usersRepository: UsersRepository, authRepository: AuthRepository, accessTokenRevocationService: AccessTokenRevocationService, auditLogsService: AuditLogsService);
    findAll(page: number, limit: number): Promise<IPaginatedResponse<IUser>>;
    findById(id: number): Promise<IUser>;
    getProfile(user: IAuthenticatedUser): IUser;
    getAllDataCount(): Promise<{
        users: number;
        audios: number;
        videos: number;
        galleries: number;
        comments: number;
    }>;
    update(id: number, dto: UpdateUserDto, actor: IAuthenticatedUser, ipAddress?: string): Promise<IUser>;
    remove(id: number, actor: IAuthenticatedUser, ipAddress?: string): Promise<{
        message: string;
    }>;
    private assertCanManageUsers;
    private revokeUserSessions;
    private mapUser;
}
