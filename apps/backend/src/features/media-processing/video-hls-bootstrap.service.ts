import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { VideoRepository } from '@/features/video/video.repository';
import { StorageService } from '@/shared/storage/storage.service';

import { VideoTranscodeService } from './video-transcode.service';

const BACKFILL_BATCH_SIZE = 50;

@Injectable()
export class VideoHlsBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(VideoHlsBootstrapService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    private readonly videoRepository: VideoRepository,
    private readonly videoTranscodeService: VideoTranscodeService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.storageService.ensureVideoStreamingAccess();

    if (this.configService.get<string>('NODE_ENV') === 'test') {
      return;
    }

    void this.backfillMissingHls().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`HLS backfill failed: ${message}`);
    });
  }

  private async backfillMissingHls(): Promise<void> {
    const videoIds = await this.videoRepository.findIdsMissingHls(BACKFILL_BATCH_SIZE);

    if (videoIds.length === 0) {
      return;
    }

    this.logger.log(`Enqueuing HLS backfill for ${videoIds.length} video(s)`);

    for (const videoId of videoIds) {
      await this.videoTranscodeService.enqueue(videoId);
    }
  }
}
