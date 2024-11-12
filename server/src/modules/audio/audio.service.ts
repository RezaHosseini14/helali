import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audio } from 'src/schemas/Audio.schema';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class AudioService {
  constructor(
    @InjectModel(Audio.name) private audioSchema: Model<Audio>,
    private readonly minioService: MinioService, // Injecting MinioService
  ) {}

  async uploadFile(
    title: string,
    bucketName: string,
    file: Express.Multer.File,
  ) {
    try {
      if (file.mimetype !== 'audio/mpeg') {
        throw new HttpException('فایل باید mp3 باشد', HttpStatus.BAD_REQUEST);
      }

      await this.minioService.uploadFile(bucketName, file);

      const filePath = `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${bucketName}/${file.originalname}`;

      const newAudio = new this.audioSchema({
        title: title,
        originalName: file.originalname,
        path: filePath,
        mimetype: file.mimetype,
        size: file.size,
      });
      await newAudio.save();

      return {
        message: 'فایل آپلود شد',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'مشکلی در آپلود فایل رخ داد',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async audiosList(bucketName: string) {
    return await this.minioService.listFiles(bucketName);
  }
}
