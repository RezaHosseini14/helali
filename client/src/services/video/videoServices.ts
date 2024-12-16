import http from '../httpService';

export function allVideo() {
  return http.get('/video');
}
export function uploadVideo(body: any) {
  return http.post('/video/upload', body);
}
