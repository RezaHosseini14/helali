import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';
import { MinioModule } from '../minio/minio.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioEntity } from './entities/audio.entity';
import { CategoryEntity } from '../category/entities/category.entity';
@Module({
  imports: [MinioModule, TypeOrmModule.forFeature([AudioEntity, CategoryEntity])],
  controllers: [AudioController],
  providers: [AudioService],
})
export class AudioModule {}
