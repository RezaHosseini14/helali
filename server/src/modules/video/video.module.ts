import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { MinioModule } from '../minio/minio.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoEntity } from './entities/video.entity';
import { CategoryEntity } from '../category/entities/category.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, MinioModule, TypeOrmModule.forFeature([VideoEntity, CategoryEntity])],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
