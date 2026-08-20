import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { Gallery } from '@prisma/client';

import { buildSafeStorageFileName, MINIO_BUCKETS } from '@helali/shared';

import { NotFoundMessage } from '@/shared/constants/messages';
import { ApiCacheService } from '@/shared/cache/api-cache.service';
import { MediaDailyStatService } from '@/shared/media-stats/media-daily-stat.service';
import { MediaViewService } from '@/shared/media-view/media-view.service';
import { StorageService } from '@/shared/storage/storage.service';
import { optimizeImageToWebp } from '@/shared/upload/image-optimize';
import { validateUploadFile } from '@/shared/upload/upload-validation';

import type { CreateGalleryDto } from './dto/create-gallery.dto';
import { GalleryRepository } from './gallery.repository';

const PRESIGNED_URL_EXPIRY = 24 * 60 * 60;
const FEATURED_SLIDER_LIMIT = 8;
const LIST_CACHE_TTL_SECONDS = 120;
const CACHE_NAMESPACE = 'gallery';

type IGalleryListItem = Pick<
  Gallery,
  | 'id'
  | 'originalName'
  | 'mimetype'
  | 'size'
  | 'desc'
  | 'like'
  | 'view'
  | 'isFeatured'
  | 'createdAt'
  | 'updatedAt'
>;

@Injectable()
export class GalleryService {
  constructor(
    private readonly galleryRepository: GalleryRepository,
    private readonly storageService: StorageService,
    private readonly mediaViewService: MediaViewService,
    private readonly mediaDailyStatService: MediaDailyStatService,
    private readonly apiCacheService: ApiCacheService,
  ) {}

  async upload(dto: CreateGalleryDto, file: Express.Multer.File) {
    const validated = validateUploadFile(file, 'image');
    const optimized = await optimizeImageToWebp(validated.buffer);
    const objectName = buildSafeStorageFileName(optimized.mimetype);

    try {
      await this.storageService.putObject(MINIO_BUCKETS.GALLERY, {
        objectName,
        buffer: optimized.buffer,
        size: optimized.size,
        mimetype: optimized.mimetype,
      });

      await this.galleryRepository.create({
        desc: dto.desc,
        originalName: objectName,
        mimetype: optimized.mimetype,
        size: optimized.size.toString(),
        isFeatured: dto.isFeatured === true,
      });

      await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);

      return { message: 'فایل‌ها با موفقیت آپلود شد' };
    } catch (error) {
      await this.storageService.deleteFiles([
        { bucketName: MINIO_BUCKETS.GALLERY, fileName: objectName },
      ]);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('مشکلی در آپلود تصویر رخ داد');
    }
  }

  async findAll(page: number, limit: number) {
    try {
      const version = await this.apiCacheService.getVersion(CACHE_NAMESPACE);

      return this.apiCacheService.getOrSet(
        `helali:gallery:list:v${version}:${page}:${limit}`,
        LIST_CACHE_TTL_SECONDS,
        async () => {
          const { items, total } = await this.galleryRepository.findMany(page, limit);
          const images = await Promise.all(items.map((image) => this.mapImageWithUrl(image)));

          return {
            images,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
          };
        },
      );
    } catch {
      throw new InternalServerErrorException('مشکلی در دریافت تصاویر رخ داد');
    }
  }

  async findFeatured() {
    try {
      const version = await this.apiCacheService.getVersion(CACHE_NAMESPACE);

      return this.apiCacheService.getOrSet(
        `helali:gallery:featured:v${version}`,
        LIST_CACHE_TTL_SECONDS,
        async () => {
          const items = await this.galleryRepository.findFeatured(FEATURED_SLIDER_LIMIT);
          const images = await Promise.all(items.map((image) => this.mapImageWithUrl(image)));

          return { images };
        },
      );
    } catch {
      throw new InternalServerErrorException('مشکلی در دریافت تصاویر منتخب رخ داد');
    }
  }

  async setFeatured(id: number, isFeatured: boolean) {
    const image = await this.galleryRepository.findById(id);

    if (!image) {
      throw new NotFoundException(NotFoundMessage.NotFoundImage);
    }

    const updated = await this.galleryRepository.setFeatured(id, isFeatured);
    await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);

    return {
      message: isFeatured ? 'تصویر به اسلایدر منتخب اضافه شد' : 'تصویر از اسلایدر منتخب برداشته شد',
      image: await this.mapImageWithUrl(updated),
    };
  }

  async like(id: number, visitorKey: string) {
    const shouldCount = await this.mediaViewService.tryClaimLike('gallery', id, visitorKey);

    if (!shouldCount) {
      const stats = await this.galleryRepository.findLikeStats(id);

      if (!stats) {
        throw new NotFoundException('فایل موردنظر یافت نشد');
      }

      return {
        message: 'لایک قبلاً ثبت شده است',
        likes: stats.like ?? 0,
        counted: false as const,
      };
    }

    const updated = await this.galleryRepository.incrementLike(id);

    if (!updated) {
      throw new NotFoundException('فایل موردنظر یافت نشد');
    }

    await this.mediaDailyStatService.recordLike('gallery', id);

    return {
      message: 'لایک ثبت شد',
      likes: updated.like,
      counted: true as const,
    };
  }

  async remove(id: number) {
    const image = await this.galleryRepository.findById(id);

    if (!image) {
      throw new NotFoundException(NotFoundMessage.NotFoundImage);
    }

    await this.storageService.deleteFile(MINIO_BUCKETS.GALLERY, image.originalName);
    this.storageService.invalidateUrlCache(MINIO_BUCKETS.GALLERY, image.originalName);
    await this.galleryRepository.delete(id);
    await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);

    return { message: 'تصویر حذف شد' };
  }

  private async mapImageWithUrl(image: IGalleryListItem | Gallery) {
    const path = await this.storageService.getPresignedUrl(
      MINIO_BUCKETS.GALLERY,
      image.originalName,
      PRESIGNED_URL_EXPIRY,
    );

    return {
      ...image,
      path,
    };
  }
}
