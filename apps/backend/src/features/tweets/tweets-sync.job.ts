import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { TweetsService } from './tweets.service';

const DEFAULT_CRON = '0 6 * * *';
const JOB_NAME = 'tweets-daily-sync';

@Injectable()
export class TweetsSyncJob implements OnModuleInit {
  private readonly logger = new Logger(TweetsSyncJob.name);

  constructor(
    private readonly tweetsService: TweetsService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit(): Promise<void> {
    void this.handleDailySync('initial').catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Initial tweets sync failed: ${message}`);
    });

    const cronExpression =
      this.configService.get<string>('tweets.syncCron')?.trim() || DEFAULT_CRON;

    const job = CronJob.from({
      cronTime: cronExpression,
      onTick: () => {
        void this.handleDailySync('scheduled');
      },
      start: false,
    });

    this.schedulerRegistry.addCronJob(JOB_NAME, job);
    job.start();
    this.logger.log(`Registered tweets sync cron: ${cronExpression}`);
  }

  async handleDailySync(trigger: 'initial' | 'scheduled' = 'scheduled'): Promise<void> {
    this.logger.log(`Starting tweets sync (${trigger})`);

    try {
      const result = await this.tweetsService.syncLatestTweets();
      this.logger.log(
        `Tweets sync (${trigger}) finished: fetched=${result.fetchedCount}, created=${result.createdCount}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Tweets sync (${trigger}) failed: ${message}`);
    }
  }
}
