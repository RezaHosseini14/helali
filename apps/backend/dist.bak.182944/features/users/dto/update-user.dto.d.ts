import { UserRole } from '@prisma/client';
export declare class UpdateUserDto {
    username?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    age?: number;
    email?: string;
    role?: UserRole;
}
