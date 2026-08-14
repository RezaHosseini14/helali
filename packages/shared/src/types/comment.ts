export type CommentStatus = 'pending' | 'published' | 'rejected';

export interface IAudioComment {
  readonly id: number;
  readonly author: string;
  readonly text: string;
  readonly status: CommentStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly audioId: number;
}

export interface IGalleryComment {
  readonly id: number;
  readonly author: string;
  readonly text: string;
  readonly status: CommentStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly galleryId: number;
}

export interface ICreateCommentInput {
  readonly author: string;
  readonly text: string;
}
