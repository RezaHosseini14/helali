import http from 'services/httpService';

export type CommentTargetType = 'audio' | 'gallery' | 'video';

interface ICommentBody {
  author: string;
  text: string;
}

export function getCommentsByTarget(type: CommentTargetType, id: number) {
  return http.get(`/comments/${type}/${id}`);
}

export function addComment(type: CommentTargetType, id: number, body: ICommentBody) {
  return http.post(`/comments/${type}/${id}`, body);
}

export function getAllComments() {
  return http.get('/comments');
}

export function updateCommentStatus(
  commentType: CommentTargetType,
  commentId: number,
  body: { newStatus: 'pending' | 'published' | 'rejected' },
) {
  return http.patch(`/comments/${commentType}/${commentId}/status`, body);
}
