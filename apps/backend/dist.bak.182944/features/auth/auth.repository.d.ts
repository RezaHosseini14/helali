import type { Prisma, User } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
declare const userAuthSelect: {
    readonly id: true;
    readonly username: true;
    readonly passwordHash: true;
    readonly firstName: true;
    readonly lastName: true;
    readonly phoneNumber: true;
    readonly age: true;
    readonly email: true;
    readonly role: true;
    readonly createdAt: true;
};
export type IUserAuthRecord = Prisma.UserGetPayload<{
    select: typeof userAuthSelect;
}>;
type IRefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
    include: {
        user: {
            select: typeof userAuthSelect;
        };
    };
}>;
export interface ICreateUserData {
    readonly username: string;
    readonly passwordHash: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly phoneNumber: string;
    readonly age?: number;
    readonly email?: string;
}
export declare class AuthRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findUserByUsername(username: string): Promise<IUserAuthRecord | null>;
    findUserByPhoneNumber(phoneNumber: string): Promise<{
        id: number;
    } | null>;
    findUserById(id: number): Promise<IUserAuthRecord | null>;
    createUser(data: ICreateUserData): Promise<User>;
    createRefreshToken(userId: number, token: string, expiresAt: Date): Promise<{
        userId: number;
        id: string;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        revokedAt: Date | null;
    }>;
    findRefreshTokenWithUser(token: string): Promise<IRefreshTokenWithUser | null>;
    rotateRefreshToken(oldToken: string, userId: number, newToken: string, expiresAt: Date): Promise<void>;
    revokeRefreshToken(token: string): Promise<void>;
    revokeAllUserTokens(userId: number): Promise<void>;
}
export {};
