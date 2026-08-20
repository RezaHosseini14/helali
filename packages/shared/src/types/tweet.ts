export interface ITweet {
  readonly id: number;
  readonly externalId: string;
  readonly username: string;
  readonly text: string;
  readonly link: string;
  readonly imageUrls: ReadonlyArray<string>;
  readonly videoUrls: ReadonlyArray<string>;
  readonly videoPosterUrls: ReadonlyArray<string>;
  readonly hasVideo: boolean;
  readonly likeCount: number;
  readonly replyCount: number;
  readonly retweetCount: number;
  readonly quoteCount: number;
  readonly publishedAt: string;
  readonly avatarUrl: string | null;
  readonly isPublished?: boolean;
}
