import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { buildSafeStorageFileName, MINIO_BUCKETS } from '@helali/shared';

import { CategoriesRepository } from '@/features/categories/categories.repository';
import { AudioRepository } from '@/features/audio/audio.repository';
import { VideoTranscodeService } from '@/features/media-processing/video-transcode.service';
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

import type { CreateVideoDto } from './dto/create-video.dto';
import type { UpdateVideoDto } from './dto/update-video.dto';
import {
  VideoRepository,
  type IVideoListItem,
  type IVideoStoryItem,
  type IVideoWithCategories,
} from './video.repository';

const PRESIGNED_URL_EXPIRY = 24 * 60 * 60;
const LIST_CACHE_TTL_SECONDS = 120;
const CACHE_NAMESPACE = 'video';

@Injectable()
export class VideoService {
  constructor(
    private readonly videoRepository: VideoRepository,
    private readonly audioRepository: AudioRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly storageService: StorageService,
    private readonly mediaViewService: MediaViewService,
    private readonly mediaDailyStatService: MediaDailyStatService,
    private readonly videoTranscodeService: VideoTranscodeService,
    private readonly apiCacheService: ApiCacheService,
  ) {}

  async upload(
    dto: CreateVideoDto,
    videoFile: Express.Multer.File,
    posterFile: Express.Multer.File,
  ) {
    const video = validateUploadFile(videoFile, 'video');
    const poster = validateUploadFile(posterFile, 'image');
    const optimizedPoster = await optimizeImageToWebp(poster.buffer);

    await this.validateCategories(dto.categories);

    if (dto.relatedAudioId !== undefined && dto.relatedAudioId !== null) {
      await this.validateRelatedAudio(dto.relatedAudioId);
    }

    const videoFileName = buildSafeStorageFileName(video.mimetype, video.originalName);
    const posterFileName = buildSafeStorageFileName(optimizedPoster.mimetype);

    try {
      await this.storageService.putObjects([
        {
          bucketName: MINIO_BUCKETS.VIDEO,
          input: {
            objectName: videoFileName,
            buffer: video.buffer,
            size: video.size,
            mimetype: video.mimetype,
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

      const createdVideo = await this.videoRepository.create({
        title: dto.title,
        text: dto.text ?? '',
        originalName: videoFileName,
        mimetype: video.mimetype,
        size: video.size.toString(),
        posterOriginalName: posterFileName,
        posterMimetype: optimizedPoster.mimetype,
        posterSize: optimizedPoster.size.toString(),
        categoryIds: dto.categories,
      });

      if (dto.relatedAudioId !== undefined && dto.relatedAudioId !== null) {
        await this.audioRepository.linkVideoToAudio(createdVideo.id, dto.relatedAudioId);
      }

      await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);
      await this.videoTranscodeService.enqueue(createdVideo.id);

      return { message: PublicMessage.UploadedFiles };
    } catch (error) {
      await this.storageService.deleteFiles([
        { bucketName: MINIO_BUCKETS.VIDEO, fileName: videoFileName },
        { bucketName: MINIO_BUCKETS.POSTER, fileName: posterFileName },
      ]);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(BadRequestMessage.UploadedFilesFailed);
    }
  }

  async findAll(page: number, limit: number) {
    try {
      const version = await this.apiCacheService.getVersion(CACHE_NAMESPACE);

      return this.apiCacheService.getOrSet(
        `helali:video:list:v${version}:${page}:${limit}`,
        LIST_CACHE_TTL_SECONDS,
        async () => {
          const { items, total } = await this.videoRepository.findMany(page, limit);
          const videos = await Promise.all(items.map((item) => this.mapVideoWithUrls(item)));

          return {
            videos,
            total,
            page,
            lastPage: total === 0 ? 0 : Math.ceil(total / limit),
          };
        },
      );
    } catch {
      throw new InternalServerErrorException(BadRequestMessage.FailedFetchingData);
    }
  }

  async findById(id: number) {
    try {
      const video = await this.videoRepository.findById(id);

      if (!video) {
        throw new NotFoundException(NotFoundMessage.NotFoundVideo);
      }

      return {
        video: await this.mapVideoWithUrls(video, { includeRelatedAudio: true }),
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
      const exists = await this.videoRepository.findViewStats(id);

      if (!exists) {
        throw new NotFoundException(NotFoundMessage.NotFoundVideo);
      }

      const items = await this.videoRepository.findSuggestions(id, limit);
      const videos = await Promise.all(items.map((item) => this.mapVideoWithUrls(item)));

      return { videos };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(BadRequestMessage.FailedFetchingData);
    }
  }

  async findStories() {
    try {
      const version = await this.apiCacheService.getVersion(CACHE_NAMESPACE);

      return this.apiCacheService.getOrSet(
        `helali:video:stories:v${version}`,
        LIST_CACHE_TTL_SECONDS,
        async () => {
          const stories = await this.videoRepository.findStories();
          const storiesWithPaths = await Promise.all(
            stories.map((story) => this.mapVideoWithUrls(story)),
          );

          return { stories: storiesWithPaths };
        },
      );
    } catch {
      throw new InternalServerErrorException(BadRequestMessage.FailedFetchingData);
    }
  }

  async like(id: number, visitorKey: string) {
    try {
      const shouldCount = await this.mediaViewService.tryClaimLike('video', id, visitorKey);

      if (!shouldCount) {
        const stats = await this.videoRepository.findViewStats(id);

        if (!stats) {
          throw new NotFoundException(NotFoundMessage.NotFoundVideo);
        }

        return {
          message: PublicMessage.LikeAlreadyCounted,
          likes: stats.like,
          counted: false as const,
        };
      }

      const updated = await this.videoRepository.incrementLike(id);

      if (!updated) {
        throw new NotFoundException(NotFoundMessage.NotFoundVideo);
      }

      await this.mediaDailyStatService.recordLike('video', id);

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
      const shouldCount = await this.mediaViewService.tryClaimView('video', id, visitorKey);

      if (!shouldCount) {
        const stats = await this.videoRepository.findViewStats(id);

        if (!stats) {
          throw new NotFoundException(NotFoundMessage.NotFoundVideo);
        }

        return {
          message: PublicMessage.ViewAlreadyCounted,
          views: stats.view,
          counted: false as const,
        };
      }

      const updated = await this.videoRepository.incrementView(id);

      if (!updated) {
        throw new NotFoundException(NotFoundMessage.NotFoundVideo);
      }

      await this.mediaDailyStatService.recordView('video', id);

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
      const video = await this.videoRepository.findById(id);

      if (!video) {
        throw new NotFoundException(NotFoundMessage.NotFoundVideo);
      }

      if (video.hlsPrefix) {
        await this.storageService.deletePrefix(MINIO_BUCKETS.VIDEO, video.hlsPrefix);
      }

      await this.storageService.deleteFiles([
        { bucketName: MINIO_BUCKETS.VIDEO, fileName: video.originalName },
        { bucketName: MINIO_BUCKETS.POSTER, fileName: video.posterOriginalName },
      ]);
      this.storageService.invalidateUrlCache(MINIO_BUCKETS.VIDEO, video.originalName);
      this.storageService.invalidateUrlCache(MINIO_BUCKETS.POSTER, video.posterOriginalName);
      await this.videoRepository.delete(id);
      await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);

      return { message: PublicMessage.DeletedFiles };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(BadRequestMessage.FailedDelete);
    }
  }

  async reprocess(id: number) {
    const video = await this.videoRepository.findById(id);

    if (!video) {
      throw new NotFoundException(NotFoundMessage.NotFoundVideo);
    }

    await this.videoTranscodeService.enqueue(id);
    await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);

    return { message: 'پردازش مجدد HLS در صف قرار گرفت' };
  }

  async update(
    id: number,
    dto: UpdateVideoDto,
    videoFile?: Express.Multer.File,
    posterFile?: Express.Multer.File,
  ) {
    try {
      const video = await this.videoRepository.findById(id);

      if (!video) {
        throw new NotFoundException(NotFoundMessage.NotFoundVideo);
      }

      if (dto.categories) {
        await this.validateCategories(dto.categories);
      }

      if (dto.relatedAudioId !== undefined) {
        if (dto.relatedAudioId !== null) {
          await this.validateRelatedAudio(dto.relatedAudioId);
        }
      }

      const currentCategoryIds = [...video.categories.map((item) => item.categoryId)].sort(
        (a, b) => a - b,
      );
      const nextCategoryIds = dto.categories
        ? [...dto.categories].sort((a, b) => a - b)
        : undefined;
      const isTitleChanged = dto.title !== undefined && video.title !== dto.title;
      const isTextChanged = dto.text !== undefined && video.text !== dto.text;
      const isCategoriesChanged =
        nextCategoryIds !== undefined &&
        (nextCategoryIds.length !== currentCategoryIds.length ||
          nextCategoryIds.some((categoryId, index) => categoryId !== currentCategoryIds[index]));
      const isVideoFileChanged = Boolean(videoFile);
      const isPosterFileChanged = Boolean(posterFile);
      const isRelatedAudioChanged = dto.relatedAudioId !== undefined;

      if (
        !(
          isTitleChanged ||
          isTextChanged ||
          isCategoriesChanged ||
          isVideoFileChanged ||
          isPosterFileChanged ||
          isRelatedAudioChanged
        )
      ) {
        throw new BadRequestException(BadRequestMessage.NoChangesDetected);
      }

      let originalName = video.originalName;
      let mimetype = video.mimetype;
      let size = video.size;
      let posterOriginalName = video.posterOriginalName;
      let posterMimetype = video.posterMimetype;
      let posterSize = video.posterSize;

      const uploadedObjects: Array<{ bucketName: string; fileName: string }> = [];
      const previousObjects: Array<{ bucketName: string; fileName: string }> = [];

      try {
        if (videoFile) {
          const validatedVideo = validateUploadFile(videoFile, 'video');
          const newVideoFileName = buildSafeStorageFileName(
            validatedVideo.mimetype,
            validatedVideo.originalName,
          );

          await this.storageService.putObject(MINIO_BUCKETS.VIDEO, {
            objectName: newVideoFileName,
            buffer: validatedVideo.buffer,
            size: validatedVideo.size,
            mimetype: validatedVideo.mimetype,
          });

          uploadedObjects.push({ bucketName: MINIO_BUCKETS.VIDEO, fileName: newVideoFileName });
          previousObjects.push({ bucketName: MINIO_BUCKETS.VIDEO, fileName: video.originalName });
          originalName = newVideoFileName;
          mimetype = validatedVideo.mimetype;
          size = validatedVideo.size.toString();
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
            fileName: video.posterOriginalName,
          });
          posterOriginalName = newPosterFileName;
          posterMimetype = optimizedPoster.mimetype;
          posterSize = optimizedPoster.size.toString();
        }

        await this.videoRepository.update(id, {
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.text !== undefined ? { text: dto.text } : {}),
          ...(dto.categories !== undefined ? { categoryIds: dto.categories } : {}),
          originalName,
          mimetype,
          size,
          posterOriginalName,
          posterMimetype,
          posterSize,
        });

        if (dto.relatedAudioId !== undefined) {
          await this.audioRepository.linkVideoToAudio(id, dto.relatedAudioId);
        }

        if (previousObjects.length > 0) {
          await this.storageService.deleteFiles(previousObjects);

          for (const item of previousObjects) {
            this.storageService.invalidateUrlCache(item.bucketName, item.fileName);
          }
        }

        await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);

        if (videoFile) {
          if (video.hlsPrefix) {
            await this.storageService.deletePrefix(MINIO_BUCKETS.VIDEO, video.hlsPrefix);
          }
          await this.videoTranscodeService.enqueue(id);
        }

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

  private async validateRelatedAudio(audioId: number) {
    const exists = await this.audioRepository.audioExists(audioId);

    if (!exists) {
      throw new BadRequestException('صوت مرتبط یافت نشد');
    }
  }

  private async mapRelatedAudioSummary(
    audio: { id: number; title: string; posterOriginalName: string } | null | undefined,
  ) {
    if (!audio) {
      return null;
    }

    const posterPath = await this.storageService.getPresignedUrl(
      MINIO_BUCKETS.POSTER,
      audio.posterOriginalName,
      PRESIGNED_URL_EXPIRY,
    );

    return {
      id: audio.id,
      title: audio.title,
      posterPath,
    };
  }

  private async mapVideoWithUrls(
    video: IVideoListItem | IVideoWithCategories | IVideoStoryItem,
    options?: {
      readonly includeRelatedAudio?: boolean;
      readonly relatedAudio?: { id: number; title: string; posterOriginalName: string } | null;
    },
  ) {
    const shouldIncludeRelatedAudio = options?.includeRelatedAudio ?? false;

    const [path, posterPath, mappedRelatedAudio] = await Promise.all([
      this.storageService.getPresignedUrl(
        MINIO_BUCKETS.VIDEO,
        video.originalName,
        PRESIGNED_URL_EXPIRY,
      ),
      this.storageService.getPresignedUrl(
        MINIO_BUCKETS.POSTER,
        video.posterOriginalName,
        PRESIGNED_URL_EXPIRY,
      ),
      shouldIncludeRelatedAudio
        ? options?.relatedAudio !== undefined
          ? this.mapRelatedAudioSummary(options.relatedAudio)
          : this.audioRepository
              .findRelatedAudioForVideo(video.id)
              .then((item) => this.mapRelatedAudioSummary(item))
        : Promise.resolve(null),
    ]);

    return {
      id: video.id,
      title: video.title,
      originalName: video.originalName,
      mimetype: video.mimetype,
      size: video.size,
      text: 'text' in video ? video.text : '',
      posterOriginalName: video.posterOriginalName,
      posterMimetype: video.posterMimetype,
      posterSize: video.posterSize,
      like: video.like,
      view: video.view,
      processingStatus:
        'processingStatus' in video ? video.processingStatus : 'ready',
      hlsMasterKey: 'hlsMasterKey' in video ? video.hlsMasterKey : null,
      hlsPrefix: 'hlsPrefix' in video ? video.hlsPrefix : null,
      durationSec: 'durationSec' in video ? video.durationSec : null,
      processingError: 'processingError' in video ? video.processingError : null,
      processedAt: 'processedAt' in video ? video.processedAt : null,
      hlsUrl:
        'hlsMasterKey' in video && video.hlsMasterKey
          ? this.storageService.getPublicObjectUrl(MINIO_BUCKETS.VIDEO, video.hlsMasterKey)
          : null,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      categories: 'categories' in video ? video.categories.map((item) => item.categoryId) : [],
      relatedAudio: shouldIncludeRelatedAudio ? mappedRelatedAudio : null,
      path,
      posterPath,
    };
  }
}
