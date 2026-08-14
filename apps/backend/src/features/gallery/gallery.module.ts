import { Module } from '@nestjs/common';

import { GalleryController } from './gallery.controller';
import { GalleryRepository } from './gallery.repository';
import { GalleryService } from './gallery.service';

@Module({
  controllers: [GalleryController],
  providers: [GalleryService, GalleryRepository],
})
export class GalleryModule {}
