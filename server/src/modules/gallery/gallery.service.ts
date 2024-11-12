import { Injectable } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class GalleryService {
  constructor(private readonly minioService: MinioService) {}
  async uploadImage(bucketName: string, file: Express.Multer.File) {
    try {
      await this.minioService.uploadFile(bucketName, file);
    } catch (error) {
      throw error;
    }
  }
}
