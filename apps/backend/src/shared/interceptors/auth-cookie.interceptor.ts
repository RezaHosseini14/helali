import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REFRESH_TOKEN_COOKIE } from '@helali/shared';
import type { Response } from 'express';
import { catchError, tap, throwError } from 'rxjs';

interface IAuthCookieResponse {
  readonly _setRefreshToken?: string;
  readonly _clearRefreshToken?: boolean;
}

@Injectable()
export class AuthCookieInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<{ url?: string }>();
    const isRefreshRoute = request.url?.includes('/auth/refresh') ?? false;

    return (next.handle() as any).pipe(
      tap((result: unknown) => {
        this.applyCookieActions(response, result);
      }),
      catchError((error: unknown) => {
        if (isRefreshRoute && error instanceof UnauthorizedException) {
          this.clearRefreshCookie(response);
        }

        return throwError(() => error);
      }),
    );
  }

  private applyCookieActions(response: Response, result: unknown): void {
    if (!this.isAuthCookieResponse(result)) {
      return;
    }

    if (result._setRefreshToken) {
      response.cookie(REFRESH_TOKEN_COOKIE, result._setRefreshToken, {
        httpOnly: true,
        secure: this.configService.get<boolean>('app.cookieSecure', false),
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      delete (result as { _setRefreshToken?: string })._setRefreshToken;
    }

    if (result._clearRefreshToken) {
      this.clearRefreshCookie(response);
      delete (result as { _clearRefreshToken?: boolean })._clearRefreshToken;
    }
  }

  private clearRefreshCookie(response: Response): void {
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: this.configService.get<boolean>('app.cookieSecure', false),
      sameSite: 'strict',
      path: '/',
    });
  }

  private isAuthCookieResponse(value: unknown): value is IAuthCookieResponse {
    return typeof value === 'object' && value !== null;
  }
}
