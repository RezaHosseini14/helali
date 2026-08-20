import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { VideoProcessingStatus } from '@prisma/client';

import { VideoRepository } from '@/features/video/video.repository';

import {
  VIDEO_TRANSCODE_QUEUE,
  type IVideoTranscodeJobData,
} from './video-transcode.constants';

@Injectable()
export class VideoTranscodeService {
  private readonly logger = new Logger(VideoTranscodeService.name);

  constructor(
    @InjectQueue(VIDEO_TRANSCODE_QUEUE)
    private readonly queue: Queue<IVideoTranscodeJobData>,
    private readonly videoRepository: VideoRepository,
  ) {}

  async enqueue(videoId: number): Promise<void> {
    await this.videoRepository.updateProcessing(videoId, {
      processingStatus: VideoProcessingStatus.pending,
      processingError: null,
    });

    await this.queue.add(
      'transcode',
      { videoId },
      {
        jobId: `video-transcode-${videoId}-${Date.now()}`,
        attempts: 2,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: 50,
        removeOnFail: 30,
      },
    );

    this.logger.log(`Enqueued HLS job for video ${videoId}`);
  }
}
