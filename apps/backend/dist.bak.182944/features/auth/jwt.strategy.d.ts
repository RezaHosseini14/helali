import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import type { IAuthenticatedUser, IJwtPayload } from '@/shared/types/auth.types';
import { AccessTokenRevocationService } from './access-token-revocation.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly accessTokenRevocationService;
    constructor(configService: ConfigService, accessTokenRevocationService: AccessTokenRevocationService);
    validate(payload: IJwtPayload): IAuthenticatedUser;
}
export {};
