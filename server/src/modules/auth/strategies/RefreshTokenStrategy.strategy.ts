import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    // در اینجا باید Refresh Token را استخراج و تأیید کنید
    const refreshToken = payload.refreshToken;
    // const isValid = await this.authService.validateRefreshToken(refreshToken);
    // if (!isValid) {
    //   throw new UnauthorizedException('Invalid refresh token');
    // }

    return {
      id: payload.userId,
      username: payload.username,
    };
  }
}
