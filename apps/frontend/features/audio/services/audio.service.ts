import type { IAudio } from '@helali/shared';

import { apiClient, unwrapApiResponse } from '@/services/api-client';

export interface IPaginatedAudios {
  readonly audios: ReadonlyArray<IAudio>;
  readonly total: number;
  readonly currentPage: number;
  readonly totalPages: number;
}

export async function getAudios(page?: number, limit?: number): Promise<IPaginatedAudios> {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.set('page', String(page));
  }

  if (limit !== undefined) {
    params.set('limit', String(limit));
  }

  const query = params.toString();
  const url = query ? `/audio?${query}` : '/audio';

  return unwrapApiResponse(apiClient.get(url));
}

export async function getAudioById(id: number): Promise<{ readonly audio: IAudio }> {
  return unwrapApiResponse(apiClient.get(`/audio/${id}`));
}

export async function likeAudio(id: number): Promise<{ readonly likes: number }> {
  return unwrapApiResponse(apiClient.post(`/audio/${id}/like`));
}

export async function viewAudio(
  id: number,
): Promise<{ readonly views: number; readonly counted: boolean }> {
  return unwrapApiResponse(apiClient.post(`/audio/${id}/view`));
}
