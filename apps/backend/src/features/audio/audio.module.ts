import { Module } from '@nestjs/common';

import { CategoriesModule } from '@/features/categories/categories.module';

import { AudioController } from './audio.controller';
import { AudioRepository } from './audio.repository';
import { AudioService } from './audio.service';

@Module({
  imports: [CategoriesModule],
  controllers: [AudioController],
  providers: [AudioService, AudioRepository],
  exports: [AudioRepository],
})
export class AudioModule {}
