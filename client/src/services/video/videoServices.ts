import http from '../httpService';

export function allVideo(page?: number, limit?: number) {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.append('page', String(page));
  }

  if (limit !== undefined) {
    params.append('limit', String(limit));
  }

  const queryString = params.toString();
  const url = queryString ? `/video?${queryString}` : '/video';

  return http.get(url);
}

export function uploadVideo(body: any) {
  return http.post('/video/upload', body);
}

export function deleteVideo(id: number) {
  return http.delete(`/video/${id}`);
}
