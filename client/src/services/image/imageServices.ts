import http from '../httpService';

export function allImage() {
  return http.get('/gallery');
}
