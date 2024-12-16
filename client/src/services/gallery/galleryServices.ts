import http from '../httpService';

export function ImageAudio(body: any) {
  return http.post('/gallery/upload', body);
}

export function deleteImage(id: number) {
  return http.delete(`/gallery/${id}`);
}
