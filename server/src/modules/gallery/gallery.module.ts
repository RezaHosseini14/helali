import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { MinioModule } from '../minio/minio.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryEntity } from './entities/gallery.entity';

@Module({
  imports: [MinioModule, TypeOrmModule.forFeature([GalleryEntity])],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
