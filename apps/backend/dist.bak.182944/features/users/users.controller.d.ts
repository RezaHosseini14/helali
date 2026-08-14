import type { Request } from 'express';
import type { IAuthenticatedUser } from '@/shared/types/auth.types';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: ListUsersDto): Promise<{
        message: string;
        data: import("@helali/shared").IPaginatedResponse<import("@helali/shared").IUser>;
    }>;
    getProfile(user: IAuthenticatedUser): {
        message: string;
        data: import("@helali/shared").IUser;
    };
    getAllDataCount(): Promise<{
        message: string;
        data: {
            users: number;
            audios: number;
            videos: number;
            galleries: number;
            comments: number;
        };
    }>;
    findById(id: number): Promise<{
        message: string;
        data: import("@helali/shared").IUser;
    }>;
    update(id: number, dto: UpdateUserDto, user: IAuthenticatedUser, request: Request): Promise<{
        message: string;
        data: import("@helali/shared").IUser;
    }>;
    remove(id: number, user: IAuthenticatedUser, request: Request): Promise<{
        message: string;
        data: null;
    }>;
}
