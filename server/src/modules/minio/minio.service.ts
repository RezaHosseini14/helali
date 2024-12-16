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

      await this.minioClient.putObject(bucketName, file.originalname, file.buffer, file.size, metaData);
      return { message: 'فایل با موفقیت آپلود شد' };
    } catch (error) {
      console.error('خطا در آپلود فایل:', error); // چاپ جزئیات خطا
      throw new HttpException(`مشکلی در آپلود فایل رخ داد: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
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

  async getPresignedUrl(bucketName: string, fileName: string, expiresIn: number): Promise<string> {
    try {
      const presignedUrl = await this.minioClient.presignedGetObject(bucketName, fileName, expiresIn);
      return presignedUrl;
    } catch (err) {
      throw new Error(`Error generating presigned URL: ${err.message}`);
    }
  }

  async deleteFile(bucketName: string, fileName: string) {
    try {
      await this.minioClient.removeObject(bucketName, fileName);
      return { message: 'فایل با موفقیت حذف شد' };
    } catch (error) {
      console.error('خطا در حذف فایل:', error);
      throw new HttpException(`مشکلی در حذف فایل رخ داد: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
