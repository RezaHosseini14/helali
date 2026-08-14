import { apiClient, unwrapApiResponse } from '@/services/api-client';

export async function getCategories(page?: number, limit?: number) {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.set('page', String(page));
  }

  if (limit !== undefined) {
    params.set('limit', String(limit));
  }

  const query = params.toString();
  const url = query ? `/categories?${query}` : '/categories';

  return unwrapApiResponse(apiClient.get(url));
}
