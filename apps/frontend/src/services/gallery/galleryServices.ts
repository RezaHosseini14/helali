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

export function ImageAudio(body: FormData, onUploadProgress?: UploadProgressHandler) {
  return http.post('/gallery/upload', body, withUploadProgress(onUploadProgress));
}

export function allImage(page?: number, limit?: number) {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.append('page', String(page));
  }

  if (limit !== undefined) {
    params.append('limit', String(limit));
  }

  const queryString = params.toString();
  const url = queryString ? `/gallery?${queryString}` : '/gallery';

  return http.get(url);
}

export function deleteImage(id: number) {
  return http.delete(`/gallery/${id}`);
}

export function likeImage(id: number) {
  return http.post(`/gallery/${id}/like`);
}

export function setImageFeatured(id: number, isFeatured: boolean) {
  return http.patch(`/gallery/${id}/featured`, { isFeatured });
}
