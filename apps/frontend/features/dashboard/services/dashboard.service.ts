import { apiClient, unwrapApiResponse } from '@/services/api-client';

export interface IDashboardOverview {
  readonly users: number;
  readonly audios: number;
  readonly videos: number;
  readonly galleries: number;
  readonly comments: number;
}

export async function getDashboardOverview(): Promise<IDashboardOverview> {
  return unwrapApiResponse(apiClient.get('/dashboard/overview'));
}
