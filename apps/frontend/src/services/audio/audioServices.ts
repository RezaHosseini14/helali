import type { AxiosProgressEvent } from 'axios';

import http from '../httpService';

export type UploadProgressHandler = (progressPercent: number) => void;

function withUploadProgress(onUploadProgress?: UploadProgressHandler) {
  return {
    timeout: 600_000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (!onUploadProgress || !event.total) {
        return;
      }

      onUploadProgress(Math.round((event.loaded / event.total) * 100));
    },
  };
}

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
  return http.post(`/audio/${id}/like`);
}

export function viewAudio(id: number) {
  return http.post(`/audio/${id}/view`);
}

export function uploadAudio(body: FormData, onUploadProgress?: UploadProgressHandler) {
  return http.post('/audio/upload', body, withUploadProgress(onUploadProgress));
}

export function updateAudioById(
  body: FormData,
  id: number,
  onUploadProgress?: UploadProgressHandler,
) {
  return http.patch(`/audio/${id}`, body, withUploadProgress(onUploadProgress));
}

export function addAudioComment(id: number, body: { author: string; text: string }) {
  return http.post(`/comments/audio/${id}`, body);
}

/** @deprecated Use getCommentsByTarget from services/comment/commentServices */
export function allAudioCommentsById(id: number) {
  return http.get(`/comments/audio/${id}`);
}

/** @deprecated Use getAllComments from services/comment/commentServices */
export function allAudioComments() {
  return http.get('/comments');
}

export function audioById(id: number) {
  return http.get(`/audio/${id}`);
}

export function deleteAudio(id: number) {
  return http.delete(`/audio/${id}`);
}
