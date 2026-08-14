import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class AuthCookieInterceptor implements NestInterceptor {
    private readonly configService;
    constructor(configService: ConfigService);
    intercept(context: ExecutionContext, next: CallHandler): any;
    private applyCookieActions;
    private clearRefreshCookie;
    private isAuthCookieResponse;
}
