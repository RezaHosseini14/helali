import { apiClient, unwrapApiResponse } from '@/services/api-client';

export type CommentTargetType = 'audio' | 'gallery' | 'video';

export async function getCommentsByTarget(type: CommentTargetType, targetId: number) {
  return unwrapApiResponse(apiClient.get(`/comments/${type}/${targetId}`));
}

export async function createComment(
  type: CommentTargetType,
  targetId: number,
  body: { author: string; text: string },
) {
  return unwrapApiResponse(apiClient.post(`/comments/${type}/${targetId}`, body));
}

/** @deprecated Use getCommentsByTarget('audio', audioId) */
export async function getAudioComments(audioId: number) {
  return getCommentsByTarget('audio', audioId);
}

/** @deprecated Use createComment('audio', audioId, body) */
export async function createAudioComment(audioId: number, body: { author: string; text: string }) {
  return createComment('audio', audioId, body);
}

export async function getAllComments() {
  return unwrapApiResponse(apiClient.get('/comments'));
}

export async function updateCommentStatus(
  type: CommentTargetType,
  id: number,
  status: 'pending' | 'published' | 'rejected',
) {
  return unwrapApiResponse(
    apiClient.patch(`/comments/${type}/${id}/status`, { newStatus: status }),
  );
}
