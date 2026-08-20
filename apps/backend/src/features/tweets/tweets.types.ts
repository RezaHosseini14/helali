export interface ITweetDraft {
  readonly externalId: string;
  readonly username: string;
  readonly text: string;
  readonly link: string;
  readonly imageUrls: readonly string[];
  readonly videoUrls: readonly string[];
  readonly videoPosterUrls: readonly string[];
  readonly hasVideo: boolean;
  readonly likeCount: number;
  readonly replyCount: number;
  readonly retweetCount: number;
  readonly quoteCount: number;
  readonly publishedAt: Date;
}

export interface ITweetListItem {
  readonly id: number;
  readonly externalId: string;
  readonly username: string;
  readonly text: string;
  readonly link: string;
  readonly imageUrls: readonly string[];
  readonly videoUrls: readonly string[];
  readonly videoPosterUrls: readonly string[];
  readonly hasVideo: boolean;
  readonly likeCount: number;
  readonly replyCount: number;
  readonly retweetCount: number;
  readonly quoteCount: number;
  readonly publishedAt: Date;
  readonly avatarUrl: string | null;
  readonly isPublished?: boolean;
}

export interface ITweetProfileUpsert {
  readonly username: string;
  readonly avatarUrl: string;
}
