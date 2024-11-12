import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private readonly minioClient: Client;

  constructor() {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_URL,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: false,
      accessKey: process.env.MINIO_accessKey, // MINIO_ROOT_USER
      secretKey: process.env.MINIO_secretKey, // MINIO_ROOT_PASSWORD
    });
  }

  async uploadFile(bucketName: string, file: Express.Multer.File) {
    try {
      await this.createBucket(bucketName);

      const metaData = {
        'Content-Type': file.mimetype,
      };

      return await this.minioClient.putObject(
        bucketName,
        file.originalname,
        file.buffer,
        file.size,
        metaData,
      );
    } catch (error) {
      throw new HttpException(
        'مشکلی در آپلود فایل رخ داد',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createBucket(bucketName: string) {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName, 'us-east-1');
    }
  }

  async listFiles(bucketName: string): Promise<any[]> {
    const items: any[] = [];
    const stream = this.minioClient.listObjects(bucketName, '', true);
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => items.push(obj));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(items));
    });
  }
}
