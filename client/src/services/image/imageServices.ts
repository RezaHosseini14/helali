import http from '../httpService';

export function allImage(page?: number, limit?: number) {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.append('page', String(page));
  }

  if (limit !== undefined) {
    params.append('limit', String(limit));
  }

  const queryString = params.toString();
  const url = queryString ? `/gallery?${queryString}` : '/gallery';

  return http.get(url);
}
