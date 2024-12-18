import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AudioEntity } from './entities/audio.entity';
import { In, Repository } from 'typeorm';
import { CreateAudioDto } from './dto/create-audio.dto';
import { CategoryEntity } from '../category/entities/category.entity';

@Injectable()
export class AudioService {
  constructor(
    private readonly minioService: MinioService,
    @InjectRepository(AudioEntity)
    private audioRepository: Repository<AudioEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}
  async uploadFile(
    createAudioDto: CreateAudioDto,
    bucketName: string,
    posterBucket: string,
    audioFile: Express.Multer.File,
    posterFile: Express.Multer.File,
  ) {
    try {
      if (audioFile.mimetype !== 'audio/mpeg') {
        throw new HttpException('فایل صوتی باید mp3 باشد', HttpStatus.BAD_REQUEST);
      }

      if (!posterFile.mimetype.startsWith('image/')) {
        throw new HttpException('فایل پوستر باید تصویر باشد', HttpStatus.BAD_REQUEST);
      }

      const { title, text, categories } = createAudioDto;

      // get categories by ids
      const audioCategories = await this.categoryRepository.findBy({
        id: In(categories),
      });

      // check exist categories
      if (audioCategories.length !== categories.length) {
        throw new HttpException('دسته‌بندی‌های وارد شده معتبر نیستند', HttpStatus.BAD_REQUEST);
      }

      // upload audio
      const audioExtension = audioFile.originalname.split('.').pop();
      const audioTimestamp = Date.now();
      const newAudioFileName = `${audioTimestamp}.${audioExtension}`;

      await this.minioService.uploadFile(bucketName, {
        ...audioFile,
        originalname: newAudioFileName,
      });

      const audioPath = `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${bucketName}/${newAudioFileName}`;

      // upload poster
      const posterExtension = posterFile.originalname.split('.').pop();
      const posterTimestamp = Date.now();
      const newPosterFileName = `${posterTimestamp}.${posterExtension}`;

      await this.minioService.uploadFile(posterBucket, {
        ...posterFile,
        originalname: newPosterFileName,
      });

      const posterPath = `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${posterBucket}/${newPosterFileName}`;

      //create and save audio
      const audio = this.audioRepository.create({
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
        categories: audioCategories,
      });

      const saveAudio = await this.audioRepository.save(audio);
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

  async audioById(id: number) {
    try {
      const audio = await this.audioRepository
        .createQueryBuilder('audio')
        .leftJoinAndSelect('audio.categories', 'category')
        .where('audio.id = :id', { id })
        .getOne();

      if (!audio) {
        throw new HttpException('فایل موردنظر یافت نشد', HttpStatus.NOT_FOUND);
      }

      const audioWithCategoryIds = {
        ...audio,
        categories: audio.categories.map((category) => category.id),
      };

      return {
        audio: audioWithCategoryIds,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (error) {
      throw new HttpException('مشکلی در دریافت فایل رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async audiosList(bucketName: string) {
    const audios = await this.minioService.listFiles(bucketName);

    if (audios.length <= 0) {
      throw new HttpException('فایلی یافت نشد', HttpStatus.NOT_FOUND);
    }

    return {
      audios,
      statusCode: HttpStatus.ACCEPTED,
    };
  }

  async findAllAudios() {
    try {
      const audios = await this.audioRepository
        .createQueryBuilder('audio')
        .leftJoinAndSelect('audio.categories', 'category')
        .orderBy('audio.title', 'DESC')
        .getMany();

      if (audios.length <= 0) {
        throw new HttpException('فایلی یافت نشد', HttpStatus.NOT_FOUND);
      }

      const audiosWithCategoryIds = audios.map((audio) => ({
        ...audio,
        categories: audio.categories.map((category) => category.id),
      }));

      return {
        audios: audiosWithCategoryIds,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (error) {
      console.error('خطا در دریافت فایل‌ها:', error);
      throw new HttpException('مشکلی در دریافت فایل‌ها رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async likeAudio(id: number) {
    try {
      const audio = await this.audioRepository.findOne({
        where: { id },
      });

      if (!audio) {
        throw new HttpException('فایل موردنظر یافت نشد', HttpStatus.NOT_FOUND);
      }

      audio.like += 1;

      await this.audioRepository.save(audio);
      return {
        message: 'لایک ثبت شد',
        statusCode: HttpStatus.OK,
        likes: audio.like,
      };
    } catch (error) {
      throw new HttpException('مشکلی در ثبت لایک رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAudio(id: number, audioBucket: string, posterBucket: string) {
    try {
      const audio = await this.audioRepository.findOne({ where: { id } });

      if (!audio) {
        throw new HttpException('فایل موردنظر یافت نشد', HttpStatus.NOT_FOUND);
      }

      await this.minioService.deleteFile(audioBucket, audio.originalName);

      await this.minioService.deleteFile(posterBucket, audio.posterOriginalName);

      await this.audioRepository.delete(id);

      return {
        message: 'فایل و پوستر با موفقیت حذف شدند',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error('خطا در حذف فایل:', error);
      throw new HttpException('مشکلی در حذف فایل رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateAudio(
    id: number,
    updateAudioDto: Partial<CreateAudioDto>,
    bucketName: string,
    posterBucket: string,
    audioFile?: Express.Multer.File,
    posterFile?: Express.Multer.File,
  ) {
    try {
      const audio = await this.audioRepository.findOne({
        where: { id },
        relations: ['categories'],
      });

      if (!audio) {
        throw new HttpException('فایل موردنظر یافت نشد', HttpStatus.NOT_FOUND);
      }

      const { title, text, categories } = updateAudioDto;

      // Update fields if provided
      if (title) audio.title = title;
      if (text) audio.text = text;

      if (categories) {
        const audioCategories = await this.categoryRepository.findBy({
          id: In(categories),
        });
        if (audioCategories.length !== categories.length) {
          throw new HttpException('دسته‌بندی‌های وارد شده معتبر نیستند', HttpStatus.BAD_REQUEST);
        }
        audio.categories = audioCategories;
      }

      // Handle audio file update if provided
      if (audioFile) {
        if (audioFile.mimetype !== 'audio/mpeg') {
          throw new HttpException('فایل صوتی باید mp3 باشد', HttpStatus.BAD_REQUEST);
        }
        const newAudioFileName = `${Date.now()}.${audioFile.originalname.split('.').pop()}`;
        await this.minioService.uploadFile(bucketName, { ...audioFile, originalname: newAudioFileName });
        await this.minioService.deleteFile(bucketName, audio.originalName);
        audio.originalName = newAudioFileName;
        audio.path = `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${bucketName}/${newAudioFileName}`;
      }

      // Handle poster file update if provided
      if (posterFile) {
        if (!posterFile.mimetype.startsWith('image/')) {
          throw new HttpException('فایل پوستر باید تصویر باشد', HttpStatus.BAD_REQUEST);
        }
        const newPosterFileName = `${Date.now()}.${posterFile.originalname.split('.').pop()}`;
        await this.minioService.uploadFile(posterBucket, { ...posterFile, originalname: newPosterFileName });
        await this.minioService.deleteFile(posterBucket, audio.posterOriginalName);
        audio.posterOriginalName = newPosterFileName;
        audio.posterPath = `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${posterBucket}/${newPosterFileName}`;
      }

      await this.audioRepository.save(audio);

      return { message: 'فایل با موفقیت به‌روزرسانی شد', statusCode: HttpStatus.OK };
    } catch (error) {
      console.error('خطا در به‌روزرسانی فایل:', error);
      throw new HttpException('مشکلی در به‌روزرسانی فایل رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
