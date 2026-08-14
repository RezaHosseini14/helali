import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { IPaginatedResponse } from '@helali/shared';

import { ApiCacheService } from '@/shared/cache/api-cache.service';
import { CategoriesRepository } from './categories.repository';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

const LIST_CACHE_TTL_SECONDS = 120;
const CACHE_NAMESPACE = 'categories';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly apiCacheService: ApiCacheService,
  ) {}

  async create(dto: CreateCategoryDto) {
    const existingTitle = await this.categoriesRepository.findByTitle(dto.title);

    if (existingTitle) {
      throw new BadRequestException(`عنوان "${dto.title}" قبلاً استفاده شده است.`);
    }

    const existingSort = await this.categoriesRepository.findBySort(dto.sort);

    if (existingSort) {
      throw new BadRequestException(`مقدار مرتب‌سازی ${dto.sort} قبلاً استفاده شده است.`);
    }

    const category = await this.categoriesRepository.create(dto);
    await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);
    await this.apiCacheService.bumpVersion('video');

    return {
      message: 'دسته‌بندی با موفقیت اضافه شد',
      category,
    };
  }

  async findAll(page: number, limit: number): Promise<IPaginatedResponse<unknown>> {
    const version = await this.apiCacheService.getVersion(CACHE_NAMESPACE);

    return this.apiCacheService.getOrSet(
      `helali:categories:list:v${version}:${page}:${limit}`,
      LIST_CACHE_TTL_SECONDS,
      async () => {
        const { items, total } = await this.categoriesRepository.findMany(page, limit);

        if (items.length === 0) {
          throw new NotFoundException('دسته‌بندی یافت نشد');
        }

        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      },
    );
  }

  async findById(id: number) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException(`دسته‌بندی با شناسه ${id} پیدا نشد.`);
    }

    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException(`دسته‌بندی با شناسه ${id} پیدا نشد.`);
    }

    if (dto.title !== undefined || dto.sort !== undefined) {
      const duplicate = await this.categoriesRepository.findDuplicate(
        id,
        dto.title,
        dto.sort,
      );

      if (duplicate) {
        if (duplicate.title === dto.title) {
          throw new BadRequestException(`عنوان "${dto.title}" قبلاً استفاده شده است.`);
        }

        if (duplicate.sort === dto.sort) {
          throw new BadRequestException(`مقدار مرتب‌سازی ${dto.sort} قبلاً استفاده شده است.`);
        }
      }
    }

    const updated = await this.categoriesRepository.update(id, dto);
    await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);
    await this.apiCacheService.bumpVersion('video');

    return {
      message: 'دسته‌بندی با موفقیت به‌روزرسانی شد',
      category: updated,
    };
  }

  async remove(id: number) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException(`دسته‌بندی با شناسه ${id} پیدا نشد.`);
    }

    await this.categoriesRepository.delete(id);
    await this.apiCacheService.bumpVersion(CACHE_NAMESPACE);
    await this.apiCacheService.bumpVersion('video');

    return {
      message: `دسته‌بندی با شناسه ${id} با موفقیت حذف شد`,
    };
  }

  async validateCategoryIds(categoryIds: ReadonlyArray<number>) {
    const categories = await this.categoriesRepository.findByIds(categoryIds);

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('دسته بندی ها را به درستی وارد کنید');
    }

    return categories;
  }
}
