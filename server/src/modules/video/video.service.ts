import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { MinioService } from '../minio/minio.service';
import { InjectRepository } from '@nestjs/typeorm';
import { VideoEntity } from './entities/video.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VideoService {
  constructor(
    private readonly minioService: MinioService,
    @InjectRepository(VideoEntity)
    private videoRepository: Repository<VideoEntity>,
  ) {}
  async uploadFile(
    createAudioDto: CreateVideoDto,
    bucketName: string,
    posterBucket: string,
    audioFile: Express.Multer.File,
    posterFile: Express.Multer.File,
  ) {
    try {
      // if (audioFile.mimetype !== 'audio/mpeg') {
      //   throw new HttpException('فایل صوتی باید mp3 باشد', HttpStatus.BAD_REQUEST);
      // }

      // if (!posterFile.mimetype.startsWith('image/')) {
      //   throw new HttpException('فایل پوستر باید تصویر باشد', HttpStatus.BAD_REQUEST);
      // }

      const { title, text } = createAudioDto;

      const audioExtension = audioFile.originalname.split('.').pop();
      const audioTimestamp = Date.now();
      const newAudioFileName = `${audioTimestamp}.${audioExtension}`;

      await this.minioService.uploadFile(bucketName, {
        ...audioFile,
        originalname: newAudioFileName,
      });

      const audioPath = `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${bucketName}/${newAudioFileName}`;

      const posterExtension = posterFile.originalname.split('.').pop();
      const posterTimestamp = Date.now();
      const newPosterFileName = `${posterTimestamp}.${posterExtension}`;

      await this.minioService.uploadFile(posterBucket, {
        ...posterFile,
        originalname: newPosterFileName,
      });

      const posterPath = `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${posterBucket}/${newPosterFileName}`;

      const audio = this.videoRepository.create({
        title,
        text,
        path: audioPath,
        posterPath: posterPath,
        originalName: newAudioFileName,
        posterOriginalName: newPosterFileName,
        size: audioFile.size.toString(),
        posterSize: posterFile.size.toString(),
        mimetype: audioFile.mimetype,
        posterMimetype: posterFile.mimetype,
      });

      const saveAudio = await this.videoRepository.save(audio);
      if (saveAudio) {
        return {
          message: 'فایل‌ها با موفقیت آپلود شدند',
          statusCode: HttpStatus.CREATED,
        };
      }
    } catch (error) {
      console.error(error);
      throw new HttpException('مشکلی در آپلود فایل‌ها رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllVideos(page: number = 1, limit: number = 100) {
    try {
      if (!page || !limit) {
        const [videos, total] = await this.videoRepository.findAndCount({
          order: {
            title: 'DESC',
          },
        });

        if (videos.length <= 0) {
          throw new HttpException('فایلی یافت نشد', HttpStatus.NOT_FOUND);
        }

        return {
          videos,
          total,
          page: 1,
          lastPage: 1,
          statusCode: HttpStatus.OK,
        };
      }

      const [videos, total] = await this.videoRepository.findAndCount({
        order: {
          title: 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      if (videos.length <= 0) {
        throw new HttpException('فایلی یافت نشد', HttpStatus.NOT_FOUND);
      }

      return {
        videos,
        total,
        page,
        lastPage: Math.ceil(total / limit),
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (error) {
      console.error('خطا در دریافت فایل‌ها:', error);
      throw new HttpException('مشکلی در دریافت فایل‌ها رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} video`;
  }

  update(id: number, updateVideoDto: UpdateVideoDto) {
    return `This action updates a #${id} video`;
  }

  async remove(id: number, videoBucket: string, posterBucket: string) {
    try {
      const video = await this.videoRepository.findOne({ where: { id } });

      if (!video) {
        throw new HttpException('فایل موردنظر یافت نشد', HttpStatus.NOT_FOUND);
      }

      await this.minioService.deleteFile(videoBucket, video.originalName);

      await this.minioService.deleteFile(posterBucket, video.posterOriginalName);

      await this.videoRepository.delete(id);

      return {
        message: 'فایل و پوستر با موفقیت حذف شدند',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error('خطا در حذف فایل:', error);
      throw new HttpException('مشکلی در حذف فایل رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
