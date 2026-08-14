import type { IApiResponse, ILoginResponse, IUserProfile } from '@helali/shared';

import { apiClient, unwrapApiResponse } from '@/services/api-client';
import { clearAccessToken, setAccessToken } from '@/services/token-store';

export interface ILoginInput {
  readonly username: string;
  readonly password: string;
}

export interface IRegisterInput {
  readonly username: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly age?: number;
  readonly email?: string;
}

export async function login(input: ILoginInput): Promise<ILoginResponse> {
  const data = await unwrapApiResponse(
    apiClient.post<IApiResponse<ILoginResponse>>('/auth/login', input),
  );

  if (!data.accessToken) {
    throw new Error('Login response did not include an access token');
  }

  setAccessToken(data.accessToken);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await unwrapApiResponse(apiClient.post<IApiResponse<null>>('/auth/logout'));
  } finally {
    clearAccessToken();
  }
}

export async function register(input: IRegisterInput): Promise<void> {
  await unwrapApiResponse(apiClient.post<IApiResponse<null>>('/auth/register', input));
}

export async function getMe(): Promise<IUserProfile> {
  return unwrapApiResponse(apiClient.get<IApiResponse<IUserProfile>>('/auth/me'));
}

export async function refreshToken(): Promise<string> {
  const data = await unwrapApiResponse(
    apiClient.post<IApiResponse<{ accessToken: string }>>('/auth/refresh'),
  );
  setAccessToken(data.accessToken);
  return data.accessToken;
}
