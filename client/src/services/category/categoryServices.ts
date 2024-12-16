import http from '../httpService';

export function allCategory() {
  return http.get('/category');
}
