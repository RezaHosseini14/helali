import type { IVideo } from '@helali/shared';

import { apiClient, unwrapApiResponse } from '@/services/api-client';

export interface IPaginatedVideos {
  readonly videos: ReadonlyArray<IVideo>;
  readonly total: number;
  readonly page: number;
  readonly lastPage: number;
}

export interface IVideoStories {
  readonly stories: ReadonlyArray<IVideo>;
}

export async function getVideos(page?: number, limit?: number): Promise<IPaginatedVideos> {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.set('page', String(page));
  }

  if (limit !== undefined) {
    params.set('limit', String(limit));
  }

  const query = params.toString();
  const url = query ? `/video?${query}` : '/video';

  return unwrapApiResponse(apiClient.get(url));
}

export async function getVideoStories(): Promise<IVideoStories> {
  return unwrapApiResponse(apiClient.get('/video/stories'));
}

export async function getVideoById(id: number): Promise<{ readonly video: IVideo }> {
  return unwrapApiResponse(apiClient.get(`/video/${id}`));
}

export async function viewVideo(
  id: number,
): Promise<{ readonly views: number; readonly counted: boolean }> {
  return unwrapApiResponse(apiClient.post(`/video/${id}/view`));
}
