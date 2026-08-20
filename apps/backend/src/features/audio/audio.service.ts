import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { buildSafeStorageFileName, MINIO_BUCKETS } from '@helali/shared';

import { CategoriesRepository } from '@/features/categories/categories.repository';
import {
  BadRequestMessage,
  NotFoundMessage,
  PublicMessage,
} from '@/shared/constants/messages';
import { ApiCacheService } from '@/shared/cache/api-cache.service';
import { StorageService } from '@/shared/storage/storage.service';
import { MediaViewService } from '@/shared/media-view/media-view.service';
import { MediaDailyStatService } from '@/shared/media-stats/media-daily-stat.service';
import { optimizeImageToWebp } from '@/shared/upload/image-optimize';
import { validateUploadFile } from '@/shared/upload/upload-validation';

import {
  AudioRepository,
  type IAudioListItem,
  type IAudioWithCategories,
} from './audio.repository';
import type { CreateAudioDto } from './dto/create-audio.dto';
import type { UpdateAudioDto } from './dto/update-audio.dto';

const PRESIGNED_URL_EXPIRY = 24 * 60 * 60;
const LIST_CACHE_TTL_SECONDS = 120;
const CACHE_NAMESPACE = 'audio';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);

  constructor(
    private readonly audioRepository: AudioRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly storageService: StorageService,
    private readonly mediaViewService: MediaViewService,
    private readonly mediaDailyStatService: MediaDailyStatService,
    private readonly apiCacheService: ApiCacheService,
  ) {}

  async upload(
    dto: CreateAudioDto,
    audioFile: Express.Multer.File,
    posterFile: Express.Multer.File,
  ) {
    const audio = validateUploadFile(audioFile, 'audio');
    const poster = validateUploadFile(posterFile, 'image');

    let optimizedPoster: Awaited<ReturnType<typeof optimizeImageToWebp>>;

    try {
      optimizedPoster = await optimizeImageToWebp(poster.buffer);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Poster optimize failed: ${message}`);
      throw new BadRequestException('بهینه‌سازی تصویر پوستر ناموفق بود');
    }

    await this.validateCategories(dto.categories);

    if (dto.relatedVideoId !== undefined && dto.relatedVideoId !== null) {
      await this.validateRelatedVideo(dto.relatedVideoId);
    }

    const audioFileName = buildSafeStorageFileName(audio.mimetype, audio.originalName);
    const posterFileName = buildSafeStorageFileName(optimizedPoster.mimetype);

    try {
      await this.storageService.putObjects([
        {
          bucketName: MINIO_BUCKETS.AUDIO,
          input: {
            objectName: audioFileName,
            buffer: audio.buffer,
            size: audio.size,
            mimetype: audio.mimetype,
          },
        },
        {
          bucketName: MINIO_BUCKETS.POSTER,
          input: {
            objectName: posterFileName,
            buffer: optimizedPoster.buffer,
            size: optimizedPoster.size,
            mimetype: optimizedPoster.mimetype,
          },
        },
      ]);

      await this.audioRepository.create({
        title: dto.title,
        text: dto.text ?? '',
        originalName: audioFileName,
        mimetype: audio.mimetype,
        size: audio.size.toString(),
        posterOriginalName: posterFileName,
        posterMimetype: optimizedPoster.mimetype,
        posterSize: optimizedPoster.size.toString(),
        categoryIds: dto.categories,
        relatedVideoId: dto.relatedVideoId ?? null,
      });

      await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);

      return { message: PublicMessage.UploadedFiles };
    } catch (error) {
      await this.storageService.deleteFiles([
        { bucketName: MINIO_BUCKETS.AUDIO, fileName: audioFileName },
        { bucketName: MINIO_BUCKETS.POSTER, fileName: posterFileName },
      ]);

      if (error instanceof HttpException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Audio upload failed: ${message}`);
      throw new InternalServerErrorException(BadRequestMessage.UploadedFilesFailed);
    }
  }

  async findAll(page: number, limit: number) {
    try {
      const version = await this.apiCacheService.getVersion(CACHE_NAMESPACE);

      return this.apiCacheService.getOrSet(
        `helali:audio:list:v${version}:${page}:${limit}`,
        LIST_CACHE_TTL_SECONDS,
        async () => {
          const { items, total } = await this.audioRepository.findMany(page, limit);
          const audios = await Promise.all(items.map((item) => this.mapAudioWithUrls(item)));

          return {
            audios,
            total,
            currentPage: page,
            totalPages: total === 0 ? 0 : Math.ceil(total / limit),
          };
        },
      );
    } catch {
      throw new InternalServerErrorException(BadRequestMessage.FailedFetchingData);
    }
  }

  async findById(id: number) {
    try {
      const audio = await this.audioRepository.findById(id);

      if (!audio) {
        throw new NotFoundException(NotFoundMessage.NotFoundAudio);
      }

      return {
        audio: await this.mapAudioWithUrls(audio),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(BadRequestMessage.FailedFetchingData);
    }
  }

  async findSuggestions(id: number, limit = 5) {
    try {
      const exists = await this.audioRepository.findViewStats(id);

      if (!exists) {
        throw new NotFoundException(NotFoundMessage.NotFoundAudio);
      }

      const items = await this.audioRepository.findSuggestions(id, limit);
      const audios = await Promise.all(items.map((item) => this.mapAudioWithUrls(item)));

      return { audios };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(BadRequestMessage.FailedFetchingData);
    }
  }

  async like(id: number, visitorKey: string) {
    try {
      const shouldCount = await this.mediaViewService.tryClaimLike('audio', id, visitorKey);

      if (!shouldCount) {
        const stats = await this.audioRepository.findViewStats(id);

        if (!stats) {
          throw new NotFoundException(NotFoundMessage.NotFoundAudio);
        }

        return {
          message: PublicMessage.LikeAlreadyCounted,
          likes: stats.like,
          counted: false as const,
        };
      }

      const updated = await this.audioRepository.incrementLike(id);

      if (!updated) {
        throw new NotFoundException(NotFoundMessage.NotFoundAudio);
      }

      await this.mediaDailyStatService.recordLike('audio', id);

      return {
        message: PublicMessage.Like,
        likes: updated.like,
        counted: true as const,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(BadRequestMessage.FailedLike);
    }
  }

  async view(id: number, visitorKey: string) {
    try {
      const shouldCount = await this.mediaViewService.tryClaimView('audio', id, visitorKey);

      if (!shouldCount) {
        const stats = await this.audioRepository.findViewStats(id);

        if (!stats) {
          throw new NotFoundException(NotFoundMessage.NotFoundAudio);
        }

        return {
          message: PublicMessage.ViewAlreadyCounted,
          views: stats.view,
          counted: false as const,
        };
      }

      const updated = await this.audioRepository.incrementView(id);

      if (!updated) {
        throw new NotFoundException(NotFoundMessage.NotFoundAudio);
      }

      await this.mediaDailyStatService.recordView('audio', id);

      return {
        message: PublicMessage.ViewCounted,
        views: updated.view,
        counted: true as const,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(BadRequestMessage.FailedView);
    }
  }

  async remove(id: number) {
    try {
      const audio = await this.audioRepository.findById(id);

      if (!audio) {
        throw new NotFoundException(NotFoundMessage.NotFoundAudio);
      }

      await this.storageService.deleteFiles([
        { bucketName: MINIO_BUCKETS.AUDIO, fileName: audio.originalName },
        { bucketName: MINIO_BUCKETS.POSTER, fileName: audio.posterOriginalName },
      ]);
      this.storageService.invalidateUrlCache(MINIO_BUCKETS.AUDIO, audio.originalName);
      this.storageService.invalidateUrlCache(MINIO_BUCKETS.POSTER, audio.posterOriginalName);
      await this.audioRepository.delete(id);
      await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);

      return { message: PublicMessage.DeletedFiles };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('مشکلی در حذف فایل رخ داد');
    }
  }

  async update(
    id: number,
    dto: UpdateAudioDto,
    audioFile?: Express.Multer.File,
    posterFile?: Express.Multer.File,
  ) {
    try {
      const audio = await this.audioRepository.findById(id);

      if (!audio) {
        throw new NotFoundException(NotFoundMessage.NotFoundAudio);
      }

      if (dto.categories) {
        await this.validateCategories(dto.categories);
      }

      if (dto.relatedVideoId !== undefined) {
        if (dto.relatedVideoId !== null) {
          await this.validateRelatedVideo(dto.relatedVideoId);
        }
      }

      let originalName = audio.originalName;
      let mimetype = audio.mimetype;
      let size = audio.size;
      let posterOriginalName = audio.posterOriginalName;
      let posterMimetype = audio.posterMimetype;
      let posterSize = audio.posterSize;

      const uploadedObjects: Array<{ bucketName: string; fileName: string }> = [];
      const previousObjects: Array<{ bucketName: string; fileName: string }> = [];

      try {
        if (audioFile) {
          const validatedAudio = validateUploadFile(audioFile, 'audio');
          const newAudioFileName = buildSafeStorageFileName(
            validatedAudio.mimetype,
            validatedAudio.originalName,
          );

          await this.storageService.putObject(MINIO_BUCKETS.AUDIO, {
            objectName: newAudioFileName,
            buffer: validatedAudio.buffer,
            size: validatedAudio.size,
            mimetype: validatedAudio.mimetype,
          });

          uploadedObjects.push({ bucketName: MINIO_BUCKETS.AUDIO, fileName: newAudioFileName });
          previousObjects.push({ bucketName: MINIO_BUCKETS.AUDIO, fileName: audio.originalName });
          originalName = newAudioFileName;
          mimetype = validatedAudio.mimetype;
          size = validatedAudio.size.toString();
        }

        if (posterFile) {
          const validatedPoster = validateUploadFile(posterFile, 'image');
          const optimizedPoster = await optimizeImageToWebp(validatedPoster.buffer);
          const newPosterFileName = buildSafeStorageFileName(optimizedPoster.mimetype);

          await this.storageService.putObject(MINIO_BUCKETS.POSTER, {
            objectName: newPosterFileName,
            buffer: optimizedPoster.buffer,
            size: optimizedPoster.size,
            mimetype: optimizedPoster.mimetype,
          });

          uploadedObjects.push({ bucketName: MINIO_BUCKETS.POSTER, fileName: newPosterFileName });
          previousObjects.push({
            bucketName: MINIO_BUCKETS.POSTER,
            fileName: audio.posterOriginalName,
          });
          posterOriginalName = newPosterFileName;
          posterMimetype = optimizedPoster.mimetype;
          posterSize = optimizedPoster.size.toString();
        }

        await this.audioRepository.update(id, {
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.text !== undefined ? { text: dto.text } : {}),
          ...(dto.categories !== undefined ? { categoryIds: dto.categories } : {}),
          ...(dto.relatedVideoId !== undefined ? { relatedVideoId: dto.relatedVideoId } : {}),
          originalName,
          mimetype,
          size,
          posterOriginalName,
          posterMimetype,
          posterSize,
        });

        if (previousObjects.length > 0) {
          await this.storageService.deleteFiles(previousObjects);

          for (const item of previousObjects) {
            this.storageService.invalidateUrlCache(item.bucketName, item.fileName);
          }
        }

        await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);

        return { message: PublicMessage.Updated };
      } catch (innerError) {
        if (uploadedObjects.length > 0) {
          await this.storageService.deleteFiles(uploadedObjects);
        }

        throw innerError;
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(BadRequestMessage.FailedUpdate);
    }
  }

  private async validateCategories(categoryIds: ReadonlyArray<number>) {
    const categories = await this.categoriesRepository.findByIds(categoryIds);

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException(BadRequestMessage.InvalidCategories);
    }
  }

  private async validateRelatedVideo(videoId: number) {
    const exists = await this.audioRepository.videoExists(videoId);

    if (!exists) {
      throw new BadRequestException('ویدیوی مرتبط یافت نشد');
    }
  }

  private async mapRelatedVideoSummary(
    video: { id: number; title: string; posterOriginalName: string } | null | undefined,
  ) {
    if (!video) {
      return null;
    }

    const posterPath = await this.storageService.getPresignedUrl(
      MINIO_BUCKETS.POSTER,
      video.posterOriginalName,
      PRESIGNED_URL_EXPIRY,
    );

    return {
      id: video.id,
      title: video.title,
      posterPath,
    };
  }

  private async mapAudioWithUrls(audio: IAudioListItem | IAudioWithCategories) {
    const [path, posterPath, relatedVideo] = await Promise.all([
      this.storageService.getPresignedUrl(
        MINIO_BUCKETS.AUDIO,
        audio.originalName,
        PRESIGNED_URL_EXPIRY,
      ),
      this.storageService.getPresignedUrl(
        MINIO_BUCKETS.POSTER,
        audio.posterOriginalName,
        PRESIGNED_URL_EXPIRY,
      ),
      'relatedVideo' in audio
        ? this.mapRelatedVideoSummary(audio.relatedVideo)
        : Promise.resolve(null),
    ]);

    return {
      id: audio.id,
      title: audio.title,
      originalName: audio.originalName,
      mimetype: audio.mimetype,
      size: audio.size,
      text: 'text' in audio ? audio.text : '',
      posterOriginalName: audio.posterOriginalName,
      posterMimetype: audio.posterMimetype,
      posterSize: audio.posterSize,
      like: audio.like,
      view: audio.view,
      createdAt: audio.createdAt,
      updatedAt: audio.updatedAt,
      categories: audio.categories.map((item) => item.categoryId),
      relatedVideo,
      path,
      posterPath,
    };
  }
}
