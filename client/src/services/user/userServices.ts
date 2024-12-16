import http from '../httpService';

export function allUser() {
  return http.get('/user');
}
