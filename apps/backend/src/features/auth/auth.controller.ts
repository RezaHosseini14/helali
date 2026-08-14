import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { CurrentUser } from '@/shared/decorators/auth.decorators';
import { Public } from '@/shared/decorators/public.decorator';
import { PublicMessage } from '@/shared/constants/messages';
import type { IAuthenticatedUser } from '@/shared/types/auth.types';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ipAddress = request.ip ?? 'unknown';
    const result = await this.authService.login(dto, ipAddress);

    this.setRefreshCookie(response, result.refreshToken);

    return {
      message: 'ورود موفق',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookieName = this.authService.getRefreshTokenCookieName();
    const refreshToken = request.cookies?.[cookieName] as string | undefined;

    try {
      const result = await this.authService.refresh(refreshToken ?? '');
      this.setRefreshCookie(response, result.refreshToken);

      return {
        message: 'توکن جدید صادر شد',
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      };
    } catch (error: unknown) {
      this.clearRefreshCookie(response);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const cookieName = this.authService.getRefreshTokenCookieName();
    const refreshToken = request.cookies?.[cookieName] as string | undefined;
    const ipAddress = request.ip ?? 'unknown';

    await this.authService.logout(refreshToken, user.id, ipAddress);
    this.clearRefreshCookie(response);

    return {
      message: PublicMessage.LoggedOut,
      data: null,
    };
  }

  @Get('me')
  getProfile(@CurrentUser() user: IAuthenticatedUser) {
    return {
      message: 'پروفایل دریافت شد',
      data: this.authService.getProfileFromAuthUser(user),
    };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);

    return {
      message: result.message,
      data: null,
    };
  }

  private setRefreshCookie(response: Response, token: string): void {
    response.cookie(this.authService.getRefreshTokenCookieName(), token, {
      httpOnly: true,
      secure: this.authService.isCookieSecure(),
      sameSite: 'strict',
      maxAge: this.authService.getRefreshTokenMaxAge(),
      path: '/',
    });
  }

  private clearRefreshCookie(response: Response): void {
    const cookieName = this.authService.getRefreshTokenCookieName();
    const baseOptions = {
      httpOnly: true,
      secure: this.authService.isCookieSecure(),
      path: '/',
    } as const;

    // Clear both current (strict) and legacy (lax) cookie attributes.
    response.clearCookie(cookieName, { ...baseOptions, sameSite: 'strict' });
    response.clearCookie(cookieName, { ...baseOptions, sameSite: 'lax' });
  }
}
