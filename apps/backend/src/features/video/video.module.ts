import { Module } from '@nestjs/common';

import { AudioModule } from '@/features/audio/audio.module';
import { CategoriesModule } from '@/features/categories/categories.module';

import { VideoController } from './video.controller';
import { VideoRepository } from './video.repository';
import { VideoService } from './video.service';

@Module({
  imports: [CategoriesModule, AudioModule],
  controllers: [VideoController],
  providers: [VideoService, VideoRepository],
})
export class VideoModule {}
