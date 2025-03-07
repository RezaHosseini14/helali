import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { MinioService } from '../minio/minio.service';
import { InjectRepository } from '@nestjs/typeorm';
import { VideoEntity } from './entities/video.entity';
import { In, Repository } from 'typeorm';
import { CategoryEntity } from '../category/entities/category.entity';

@Injectable()
export class VideoService {
  constructor(
    private readonly minioService: MinioService,
    @InjectRepository(VideoEntity)
    private videoRepository: Repository<VideoEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}
  async uploadFile(
    createVideoDto: CreateVideoDto,
    bucketName: string,
    posterBucket: string,
    videoFile: Express.Multer.File,
    posterFile: Express.Multer.File,
  ) {
    try {
      // if (!videoFile.mimetype.startsWith('video/')) {
      //   throw new HttpException('فایل ویدیو باید یک فرمت ویدیویی معتبر باشد', HttpStatus.BAD_REQUEST);
      // }

      if (!posterFile.mimetype.startsWith('image/')) {
        throw new HttpException('فایل پوستر باید تصویر باشد', HttpStatus.BAD_REQUEST);
      }

      const { title, text, categories } = createVideoDto;

      // دریافت دسته‌بندی‌ها از دیتابیس بر اساس ID
      const videoCategories = await this.categoryRepository.findBy({
        id: In(categories),
      });

      // بررسی معتبر بودن دسته‌بندی‌ها
      if (videoCategories.length !== categories.length) {
        throw new HttpException('دسته‌بندی‌های وارد شده معتبر نیستند', HttpStatus.BAD_REQUEST);
      }

      // آپلود ویدیو
      const videoExtension = videoFile.originalname.split('.').pop();
      const videoTimestamp = Date.now();
      const newVideoFileName = `${videoTimestamp}.${videoExtension}`;

      await this.minioService.uploadFile(bucketName, {
        ...videoFile,
        originalname: newVideoFileName,
      });

      const videoPath = `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${bucketName}/${newVideoFileName}`;

      // آپلود پوستر
      const posterExtension = posterFile.originalname.split('.').pop();
      const posterTimestamp = Date.now();
      const newPosterFileName = `${posterTimestamp}.${posterExtension}`;

      await this.minioService.uploadFile(posterBucket, {
        ...posterFile,
        originalname: newPosterFileName,
      });

      const posterPath = `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${posterBucket}/${newPosterFileName}`;

      // ایجاد و ذخیره ویدیو در دیتابیس
      const video = this.videoRepository.create({
        title,
        text,
        path: videoPath,
        posterPath: posterPath,
        originalName: newVideoFileName,
        posterOriginalName: newPosterFileName,
        size: videoFile.size.toString(),
        posterSize: posterFile.size.toString(),
        mimetype: videoFile.mimetype,
        posterMimetype: posterFile.mimetype,
        categories: videoCategories,
      });

      const saveVideo = await this.videoRepository.save(video);
      if (saveVideo) {
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

  async findAllVideos(page?: number, limit?: number) {
    try {
      if (!limit) {
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
      const currentPage = page && page > 0 ? page : 1;
      const [videos, total] = await this.videoRepository.findAndCount({
        order: {
          title: 'DESC',
        },
        skip: currentPage ? (currentPage - 1) * limit : 0,
        take: limit,
      });
      if (videos.length <= 0) {
        throw new HttpException('فایلی یافت نشد', HttpStatus.NOT_FOUND);
      }
      return {
        videos,
        total,
        page: currentPage,
        lastPage: Math.ceil(total / limit),
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (error) {
      console.error('خطا در دریافت فایل‌ها:', error);
      throw new HttpException('مشکلی در دریافت فایل‌ها رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const video = await this.videoRepository.findOne({
        where: { id },
      });

      if (!video) {
        throw new HttpException('فایل موردنظر یافت نشد', HttpStatus.NOT_FOUND);
      }

      return {
        video,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (error) {
      throw new HttpException('مشکلی در دریافت فایل رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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

  async findAllStories() {
    try {
      const stories = await this.videoRepository
        .createQueryBuilder('video')
        .innerJoin('video.categories', 'category')
        .where('category.title = :categoryTitle', { categoryTitle: 'reels' })
        .select([
          'video.title',
          'video.originalName',
          'video.path',
          'video.mimetype',
          'video.text',
          'video.posterOriginalName',
          'video.posterPath',
          'video.created_at',
        ])
        .getMany();

      if (stories.length <= 0) {
        throw new HttpException('فایلی یافت نشد', HttpStatus.NOT_FOUND);
      }
      return { stories, statusCode: HttpStatus.OK };
    } catch (error) {
      console.error(error);
      throw new HttpException('مشکلی در دریافت ویدیوها رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
