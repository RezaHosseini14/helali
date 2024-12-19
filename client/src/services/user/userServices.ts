import http from '../httpService';

export function allUser(page?: number, limit?: number) {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.append('page', String(page));
  }

  if (limit !== undefined) {
    params.append('limit', String(limit));
  }

  const queryString = params.toString();
  const url = queryString ? `/user?${queryString}` : '/user';

  return http.get(url);
}
