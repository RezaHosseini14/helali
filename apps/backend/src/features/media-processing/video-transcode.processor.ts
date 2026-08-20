import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { VideoProcessingStatus } from '@prisma/client';

import { MINIO_BUCKETS } from '@helali/shared';

import { VideoRepository } from '@/features/video/video.repository';
import { StorageService } from '@/shared/storage/storage.service';

import { FfmpegHlsService } from './ffmpeg-hls.service';
import {
  VIDEO_TRANSCODE_QUEUE,
  type IVideoTranscodeJobData,
} from './video-transcode.constants';

@Processor(VIDEO_TRANSCODE_QUEUE, { concurrency: 1 })
export class VideoTranscodeProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoTranscodeProcessor.name);

  constructor(
    private readonly videoRepository: VideoRepository,
    private readonly storageService: StorageService,
    private readonly ffmpegHlsService: FfmpegHlsService,
  ) {
    super();
  }

  async process(job: Job<IVideoTranscodeJobData>): Promise<void> {
    const { videoId } = job.data;
    const video = await this.videoRepository.findById(videoId);

    if (!video) {
      this.logger.warn(`Video ${videoId} missing — skipping transcode`);
      return;
    }

    await this.videoRepository.updateProcessing(videoId, {
      processingStatus: VideoProcessingStatus.processing,
      processingError: null,
    });

    const workDir = await this.ffmpegHlsService.createTempWorkspace();
    const sourcePath = join(workDir, `source-${video.originalName}`);

    try {
      await this.storageService.downloadObjectToFile(
        MINIO_BUCKETS.VIDEO,
        video.originalName,
        sourcePath,
      );

      if (video.hlsPrefix) {
        await this.storageService.deletePrefix(MINIO_BUCKETS.VIDEO, video.hlsPrefix);
      }

      const result = await this.ffmpegHlsService.transcodeToHls(sourcePath, workDir);
      const prefix = `hls/${videoId}-${randomUUID()}`;
      await this.storageService.uploadDirectory(
        MINIO_BUCKETS.VIDEO,
        result.outputDir,
        prefix,
      );

      const masterKey = `${prefix}/${result.masterFileName}`;

      await this.videoRepository.updateProcessing(videoId, {
        processingStatus: VideoProcessingStatus.ready,
        hlsMasterKey: masterKey,
        hlsPrefix: `${prefix}/`,
        durationSec: result.durationSec,
        processingError: null,
        processedAt: new Date(),
      });

      this.logger.log(`HLS ready for video ${videoId} → ${masterKey}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown transcode error';
      this.logger.error(`HLS failed for video ${videoId}: ${message}`);

      await this.videoRepository.updateProcessing(videoId, {
        processingStatus: VideoProcessingStatus.failed,
        processingError: message.slice(0, 500),
      });

      throw error;
    } finally {
      await this.ffmpegHlsService.removeWorkspace(workDir);
    }
  }
}
