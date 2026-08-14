import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import type { IAuthenticatedUser } from '@/shared/types/auth.types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    login(dto: LoginDto, request: Request, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
            user: import("@helali/shared").IUserProfile;
        };
    }>;
    refresh(request: Request, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
            user: import("@helali/shared").IUserProfile;
        };
    }>;
    logout(request: Request, response: Response, user: IAuthenticatedUser): Promise<{
        message: "با موفقیت خارج شدید";
        data: null;
    }>;
    getProfile(user: IAuthenticatedUser): Promise<{
        message: string;
        data: import("@helali/shared").IUserProfile;
    }>;
    register(dto: RegisterDto): Promise<{
        message: string;
        data: null;
    }>;
    private setRefreshCookie;
    private clearRefreshCookie;
    private isCookieSecure;
}
