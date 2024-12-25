import http from 'services/httpService';

export function updateCommentStatus(commentType: string, commentId: number, body: any) {
  return http.put(`/comments/${commentType}/${commentId}/status`, body);
}
