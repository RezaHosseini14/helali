import http from '../httpService';

export function allAudio(page?: number, limit?: number) {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.append('page', String(page));
  }

  if (limit !== undefined) {
    params.append('limit', String(limit));
  }

  const queryString = params.toString();
  const url = queryString ? `/audio?${queryString}` : '/audio';

  return http.get(url);
}

export function likeAudio(id: number) {
  return http.patch(`/audio/like/${id}`);
}

export function uploadAudio(body: any) {
  return http.post('/audio/upload', body);
}

export function updateAudioById(body: any, id: number) {
  return http.patch(`/audio/${id}`, body);
}

export function addAudioComment(id: number, body: any) {
  return http.post(`/comments/audio/${id}`, body);
}

export function allAudioCommentsById(id: number) {
  return http.get(`/comments/audio/${id}`);
}

export function allAudioComments() {
  return http.get(`/comments/audio`);
}

export function audioById(id: number) {
  return http.get(`/audio/${id}`);
}

export function deleteAudio(id: number) {
  return http.delete(`/audio/${id}`);
}

// export function createEvents(data: any) {
//   return jwtHttp.post("/event", data);
// }
