import http from '../httpService';

export function allAudio() {
  return http.get('/audio');
}

export function likeAudio(id: number) {
  return http.patch(`/audio/like/${id}`);
}

export function uploadAudio(body: any) {
  return http.post('/audio/upload', body);
}

export function addAudioComment(id: number, body: any) {
  return http.post(`/comments/audio/${id}`, body);
}

export function allAudioComments() {
  return http.get('/comments/audio');
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
