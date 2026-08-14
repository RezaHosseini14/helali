import type { IGallery } from '@helali/shared';

import { apiClient, unwrapApiResponse } from '@/services/api-client';

export interface IPaginatedGallery {
  readonly images: ReadonlyArray<IGallery>;
  readonly total: number;
  readonly currentPage: number;
  readonly totalPages: number;
}

export interface IFeaturedGallery {
  readonly images: ReadonlyArray<IGallery>;
}

export async function getGallery(page?: number, limit?: number): Promise<IPaginatedGallery> {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.set('page', String(page));
  }

  if (limit !== undefined) {
    params.set('limit', String(limit));
  }

  const query = params.toString();
  const url = query ? `/gallery?${query}` : '/gallery';

  return unwrapApiResponse(apiClient.get(url));
}

export async function getFeaturedGallery(): Promise<IFeaturedGallery> {
  return unwrapApiResponse(apiClient.get('/gallery/featured'));
}
