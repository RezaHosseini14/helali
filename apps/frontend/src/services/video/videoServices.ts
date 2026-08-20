import type { AxiosProgressEvent } from 'axios';

import http from '../httpService';

export type UploadProgressHandler = (progressPercent: number) => void;

function withUploadProgress(onUploadProgress?: UploadProgressHandler) {
  return {
    timeout: 0,
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (!onUploadProgress || !event.total) {
        return;
      }

      onUploadProgress(Math.round((event.loaded / event.total) * 100));
    },
  };
}

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

export function uploadVideo(body: FormData, onUploadProgress?: UploadProgressHandler) {
  return http.post('/video/upload', body, withUploadProgress(onUploadProgress));
}

export function deleteVideo(id: number) {
  return http.delete(`/video/${id}`);
}

export function videoById(id: number) {
  return http.get(`/video/${id}`);
}

export function likeVideo(id: number) {
  return http.post(`/video/${id}/like`);
}

export function videoSuggestions(id: number, limit = 5) {
  return http.get(`/video/${id}/suggestions`, { params: { limit } });
}


export function allStories() {
  return http.get('/video/stories');
}

export function updateVideoById(
  body: FormData,
  id: number,
  onUploadProgress?: UploadProgressHandler,
) {
  return http.patch(`/video/${id}`, body, withUploadProgress(onUploadProgress));
}

export function reprocessVideo(id: number) {
  return http.post(`/video/${id}/reprocess`);
}

