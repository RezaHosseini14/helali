import type { IUserProfile } from './user';

export interface IAuthTokens {
  readonly accessToken: string;
}

export interface ILoginResponse {
  readonly accessToken: string;
  readonly user: IUserProfile;
}
