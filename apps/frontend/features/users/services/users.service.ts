import type { IUser } from '@helali/shared';

import { apiClient, unwrapApiResponse } from '@/services/api-client';

export async function getUsers(page: number, limit: number) {
  return unwrapApiResponse(
    apiClient.get('/users', {
      params: { page, limit },
    }),
  );
}

export async function getUserById(id: number): Promise<IUser> {
  return unwrapApiResponse(apiClient.get(`/users/${id}`));
}

export async function getAllDataCount() {
  return unwrapApiResponse(
    apiClient.get<never>('/users/all-data-count'),
  ) as Promise<{
    users: number;
    audios: number;
    videos: number;
    galleries: number;
    comments: number;
  }>;
}
