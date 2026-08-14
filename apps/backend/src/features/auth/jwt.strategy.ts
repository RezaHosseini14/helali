import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthMessage } from '@/shared/constants/messages';
import type { IAuthenticatedUser, IJwtPayload } from '@/shared/types/auth.types';

import { AccessTokenRevocationService } from './access-token-revocation.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly accessTokenRevocationService: AccessTokenRevocationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  validate(payload: IJwtPayload): IAuthenticatedUser {
    if (
      !payload.sub ||
      !payload.username ||
      !payload.role ||
      !payload.firstName ||
      !payload.lastName ||
      !payload.phoneNumber ||
      !Array.isArray(payload.permissions)
    ) {
      throw new UnauthorizedException(AuthMessage.AuthenticationRequired);
    }

    if (
      this.accessTokenRevocationService.isUserSessionRevoked(payload.sub, payload.iat)
    ) {
      throw new UnauthorizedException(AuthMessage.AuthenticationRequired);
    }

    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
      permissions: payload.permissions,
    };
  }
}
