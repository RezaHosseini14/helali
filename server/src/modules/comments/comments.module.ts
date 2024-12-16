import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { AudioCommentsEntity } from './entities/audioComment.entity';
import { AudioEntity } from '../audio/entities/audio.entity';
import { GalleryCommentsEntity } from './entities/galleryComments.entity';
import { GalleryEntity } from '../gallery/entities/gallery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AudioCommentsEntity, GalleryCommentsEntity, AudioEntity, GalleryEntity])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
