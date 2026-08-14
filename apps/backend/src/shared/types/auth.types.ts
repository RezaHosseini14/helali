export { REFRESH_TOKEN_COOKIE } from '@helali/shared';

export interface IJwtPayload {
  readonly sub: number;
  readonly username: string;
  readonly role: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly permissions: ReadonlyArray<string>;
  readonly iat?: number;
  readonly exp?: number;
}

export interface IRefreshJwtPayload {
  readonly sub: number;
  readonly username: string;
  readonly role: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly permissions: ReadonlyArray<string>;
  readonly jti: string;
  readonly type: 'refresh';
  readonly exp?: number;
  readonly iat?: number;
}

export interface IAuthenticatedUser {
  readonly id: number;
  readonly username: string;
  readonly role: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly permissions: ReadonlyArray<string>;
}
