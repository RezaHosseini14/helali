import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';



import type { IPaginatedResponse } from '@helali/shared';



import { TweetFeedFetcher } from './tweet-feed.fetcher';

import { TweetMediaService } from './tweet-media.service';

import { TweetsRepository } from './tweets.repository';

import type { ITweetListItem } from './tweets.types';



const DEFAULT_SYNC_LIMIT = 25;

const DEFAULT_LIST_LIMIT = 20;

const MAX_LIST_LIMIT = 99;



@Injectable()

export class TweetsService {

  private readonly logger = new Logger(TweetsService.name);



  constructor(

    private readonly tweetsRepository: TweetsRepository,

    private readonly tweetFeedFetcher: TweetFeedFetcher,

    private readonly tweetMediaService: TweetMediaService,

    private readonly configService: ConfigService,

  ) {}



  async findLatest(limitRaw?: number): Promise<ITweetListItem[]> {

    const limit = Math.min(

      Math.max(Number(limitRaw) || DEFAULT_LIST_LIMIT, 1),

      MAX_LIST_LIMIT,

    );

    return this.tweetsRepository.findLatestPublished(limit);

  }



  async findAllAdmin(page: number, limit: number): Promise<IPaginatedResponse<ITweetListItem>> {

    const { items, total } = await this.tweetsRepository.findManyAdmin(page, limit);



    return {

      items,

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit) || 1,

    };

  }



  async updatePublished(id: number, isPublished: boolean): Promise<ITweetListItem> {

    return this.tweetsRepository.updatePublished(id, isPublished);

  }



  async syncLatestTweets(): Promise<{ createdCount: number; fetchedCount: number }> {

    const username =

      this.configService.get<string>('tweets.username')?.trim() || 'helalireza';



    await this.syncProfileAvatar(username);



    const drafts = await this.tweetFeedFetcher.fetchLatest(username, DEFAULT_SYNC_LIMIT);

    const withMedia = await this.tweetMediaService.enrichAndMirror(drafts);

    const createdCount = await this.tweetsRepository.upsertMany(withMedia);

    await this.syncEngagementForStoredTweets();



    this.logger.log(

      `Tweets sync for @${username}: fetched=${drafts.length}, created=${createdCount}`,

    );



    return {

      createdCount,

      fetchedCount: drafts.length,

    };

  }



  async syncEngagementForStoredTweets(): Promise<number> {

    const externalIds = await this.tweetsRepository.findExternalIds();

    let updatedCount = 0;



    for (const externalId of externalIds) {

      try {

        const engagement = await this.tweetMediaService.fetchEngagement(externalId);

        await this.tweetsRepository.updateEngagement(externalId, engagement);

        updatedCount += 1;

      } catch (error) {

        const message = error instanceof Error ? error.message : String(error);

        this.logger.warn(`Engagement sync failed for ${externalId}: ${message}`);

      }

    }



    this.logger.log(`Engagement synced for ${updatedCount}/${externalIds.length} tweets`);

    return updatedCount;

  }



  private async syncProfileAvatar(username: string): Promise<void> {

    try {

      const remoteAvatarUrl = await this.tweetFeedFetcher.fetchAvatarUrl(username);

      if (!remoteAvatarUrl) {

        this.logger.warn(`No avatar found on Nitter for @${username}`);

        return;

      }



      const mirroredAvatarUrl = await this.tweetMediaService.mirrorAvatar(

        username,

        remoteAvatarUrl,

      );

      await this.tweetsRepository.upsertProfile({

        username,

        avatarUrl: mirroredAvatarUrl,

      });

      this.logger.log(`Synced avatar for @${username}`);

    } catch (error) {

      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(`Avatar sync failed for @${username}: ${message}`);

    }

  }

}

