import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { VideoModule } from '@/features/video/video.module';

import { FfmpegHlsService } from './ffmpeg-hls.service';
import { VideoHlsBootstrapService } from './video-hls-bootstrap.service';
import { VIDEO_TRANSCODE_QUEUE } from './video-transcode.constants';
import { VideoTranscodeProcessor } from './video-transcode.processor';
import { VideoTranscodeService } from './video-transcode.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        prefix: configService.get<string>('redis.bullPrefix', 'helali'),
        connection: {
          url:
            configService.get<string>('redis.url') ??
            process.env.REDIS_URL ??
            'redis://localhost:6379',
          maxRetriesPerRequest: null,
        },
      }),
    }),
    BullModule.registerQueue({
      name: VIDEO_TRANSCODE_QUEUE,
    }),
    forwardRef(() => VideoModule),
  ],
  providers: [
    FfmpegHlsService,
    VideoTranscodeService,
    VideoTranscodeProcessor,
    VideoHlsBootstrapService,
  ],
  exports: [VideoTranscodeService],
})
export class MediaProcessingModule {}
