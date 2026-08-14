import type { Prisma, User, UserRole } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
declare const userSelect: {
    readonly id: true;
    readonly username: true;
    readonly firstName: true;
    readonly lastName: true;
    readonly phoneNumber: true;
    readonly age: true;
    readonly email: true;
    readonly role: true;
    readonly createdAt: true;
};
export type IUserRecord = Prisma.UserGetPayload<{
    select: typeof userSelect;
}>;
export interface IListUsersInput {
    readonly page: number;
    readonly limit: number;
}
export interface IUpdateUserData {
    readonly username?: string;
    readonly passwordHash?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly phoneNumber?: string;
    readonly age?: number;
    readonly email?: string | null;
    readonly role?: UserRole;
}
export declare class UsersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(input: IListUsersInput): Promise<{
        items: {
            id: number;
            createdAt: Date;
            username: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            age: number | null;
            email: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        total: number;
    }>;
    findById(id: number): Promise<IUserRecord | null>;
    findByIdWithPassword(id: number): Promise<{
        id: number;
        createdAt: Date;
        username: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        age: number | null;
        email: string | null;
        role: import(".prisma/client").$Enums.UserRole;
    } | null>;
    update(id: number, data: IUpdateUserData): Promise<IUserRecord>;
    delete(id: number): Promise<User>;
    countAll(): Promise<number>;
    countAudios(): Promise<number>;
    countVideos(): Promise<number>;
    countGalleries(): Promise<number>;
    countComments(): Promise<number>;
}
export {};
