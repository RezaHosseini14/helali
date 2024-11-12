import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';

@Module({
  providers: [MinioService],
  exports: [MinioService], // برای صادر کردن MinioService
})
export class MinioModule {}
