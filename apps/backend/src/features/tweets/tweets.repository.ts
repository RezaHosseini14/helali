import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/shared/prisma/prisma.service';

import type { ITweetDraft, ITweetListItem, ITweetProfileUpsert } from './tweets.types';

const tweetPublicSelect = {
  id: true,
  externalId: true,
  username: true,
  text: true,
  link: true,
  imageUrls: true,
  videoUrls: true,
  videoPosterUrls: true,
  hasVideo: true,
  likeCount: true,
  replyCount: true,
  retweetCount: true,
  quoteCount: true,
  publishedAt: true,
} as const;

const tweetAdminSelect = {
  ...tweetPublicSelect,
  isPublished: true,
} as const;

@Injectable()
export class TweetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatestPublished(limit: number): Promise<ITweetListItem[]> {
    const tweets = await this.prisma.tweet.findMany({
      where: { isPublished: true },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      select: tweetPublicSelect,
    });

    return this.attachAvatars(tweets);
  }

  async findManyAdmin(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.tweet.findMany({
        select: tweetAdminSelect,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.tweet.count(),
    ]);

    const tweetsWithAvatars = await this.attachAvatars(items);

    return { items: tweetsWithAvatars, total };
  }

  async updatePublished(id: number, isPublished: boolean): Promise<ITweetListItem> {
    try {
      const updated = await this.prisma.tweet.update({
        where: { id },
        data: { isPublished },
        select: tweetAdminSelect,
      });

      const [withAvatar] = await this.attachAvatars([updated]);
      return withAvatar;
    } catch {
      throw new NotFoundException('توییت یافت نشد');
    }
  }

  async findExternalIds(): Promise<ReadonlyArray<string>> {
    const rows = await this.prisma.tweet.findMany({
      select: { externalId: true },
      orderBy: { publishedAt: 'desc' },
    });
    return rows.map((row) => row.externalId);
  }

  async updateEngagement(
    externalId: string,
    engagement: {
      readonly likeCount: number;
      readonly replyCount: number;
      readonly retweetCount: number;
      readonly quoteCount: number;
    },
  ): Promise<void> {
    await this.prisma.tweet.update({
      where: { externalId },
      data: {
        likeCount: engagement.likeCount,
        replyCount: engagement.replyCount,
        retweetCount: engagement.retweetCount,
        quoteCount: engagement.quoteCount,
        fetchedAt: new Date(),
      },
    });
  }

  async upsertProfile(profile: ITweetProfileUpsert): Promise<void> {
    const username = profile.username.trim().replace(/^@/, '').toLowerCase();
    await this.prisma.tweetProfile.upsert({
      where: { username },
      create: {
        username,
        avatarUrl: profile.avatarUrl,
      },
      update: {
        avatarUrl: profile.avatarUrl,
      },
    });
  }

  async upsertMany(drafts: readonly ITweetDraft[]): Promise<number> {
    if (drafts.length === 0) {
      return 0;
    }

    let changedCount = 0;

    for (const draft of drafts) {
      const result = await this.prisma.tweet.upsert({
        where: { externalId: draft.externalId },
        create: {
          externalId: draft.externalId,
          username: draft.username,
          text: draft.text,
          link: draft.link,
          imageUrls: [...draft.imageUrls],
          videoUrls: [...draft.videoUrls],
          videoPosterUrls: [...draft.videoPosterUrls],
          hasVideo: draft.hasVideo,
          likeCount: draft.likeCount,
          replyCount: draft.replyCount,
          retweetCount: draft.retweetCount,
          quoteCount: draft.quoteCount,
          publishedAt: draft.publishedAt,
        },
        update: {
          text: draft.text,
          link: draft.link,
          imageUrls: [...draft.imageUrls],
          videoUrls: [...draft.videoUrls],
          videoPosterUrls: [...draft.videoPosterUrls],
          hasVideo: draft.hasVideo,
          likeCount: draft.likeCount,
          replyCount: draft.replyCount,
          retweetCount: draft.retweetCount,
          quoteCount: draft.quoteCount,
          publishedAt: draft.publishedAt,
          fetchedAt: new Date(),
        },
        select: { id: true },
      });

      if (result.id) {
        changedCount += 1;
      }
    }

    return changedCount;
  }

  private async attachAvatars<
    TTweet extends { readonly username: string },
  >(tweets: readonly TTweet[]): Promise<Array<TTweet & { avatarUrl: string | null }>> {
    if (tweets.length === 0) {
      return [];
    }

    const usernames = [...new Set(tweets.map((tweet) => tweet.username.toLowerCase()))];
    const profiles = await this.prisma.tweetProfile.findMany({
      where: {
        username: {
          in: usernames,
        },
      },
      select: {
        username: true,
        avatarUrl: true,
      },
    });

    const avatarByUsername = new Map(
      profiles.map((profile) => [profile.username.toLowerCase(), profile.avatarUrl] as const),
    );

    return tweets.map((tweet) => ({
      ...tweet,
      avatarUrl: avatarByUsername.get(tweet.username.toLowerCase()) ?? null,
    }));
  }
}
