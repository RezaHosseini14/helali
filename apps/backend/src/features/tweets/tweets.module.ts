import { Module } from '@nestjs/common';

import { TweetFeedFetcher } from './tweet-feed.fetcher';
import { TweetMediaService } from './tweet-media.service';
import { TweetsController } from './tweets.controller';
import { TweetsRepository } from './tweets.repository';
import { TweetsService } from './tweets.service';
import { TweetsSyncJob } from './tweets-sync.job';

@Module({
  controllers: [TweetsController],
  providers: [
    TweetsService,
    TweetsRepository,
    TweetFeedFetcher,
    TweetMediaService,
    TweetsSyncJob,
  ],
  exports: [TweetsService],
})
export class TweetsModule {}
