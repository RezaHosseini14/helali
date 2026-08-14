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
  const url = queryString ? `/users?${queryString}` : '/users';

  return http.get(url);
}

export function deleteUser(id: number) {
  return http.delete(`/users/${id}`);
}

export function allDataCount() {
  return http.get('/users/all-data-count');
}

export function registerUser(data: unknown) {
  return http.post('/auth/register', data);
}
