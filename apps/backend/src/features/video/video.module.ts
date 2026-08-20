import { Module, forwardRef } from '@nestjs/common';

import { AudioModule } from '@/features/audio/audio.module';
import { CategoriesModule } from '@/features/categories/categories.module';
import { MediaProcessingModule } from '@/features/media-processing/media-processing.module';

import { VideoController } from './video.controller';
import { VideoRepository } from './video.repository';
import { VideoService } from './video.service';

@Module({
  imports: [CategoriesModule, AudioModule, forwardRef(() => MediaProcessingModule)],
  controllers: [VideoController],
  providers: [VideoService, VideoRepository],
  exports: [VideoRepository, VideoService],
})
export class VideoModule {}
