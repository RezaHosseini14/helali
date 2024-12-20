import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(@InjectRepository(CategoryEntity) private categoryRepository: Repository<CategoryEntity>) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const { title, sort } = createCategoryDto;

      const existingTitle = await this.categoryRepository.findOne({ where: { title } });

      if (existingTitle) {
        throw new HttpException(`عنوان "${title}" قبلاً استفاده شده است.`, HttpStatus.BAD_REQUEST);
      }

      const existingSort = await this.categoryRepository.findOne({
        where: { sort },
      });

      if (existingSort) {
        throw new HttpException(`مقدار مرتب‌سازی ${sort} قبلاً استفاده شده است.`, HttpStatus.BAD_REQUEST);
      }

      const category = this.categoryRepository.create({
        title,
        sort,
      });

      const saveCategory = await this.categoryRepository.save(category);

      if (saveCategory) {
        return {
          message: 'دسته‌بندی با موفقیت اضافه شد',
          statusCode: HttpStatus.CREATED,
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'خطایی در ذخیره‌سازی دسته‌بندی رخ داده است',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(limit: number = 100, page: number = 1) {
    try {
      if (!page || !limit) {
        const categories = await this.categoryRepository
          .createQueryBuilder('category')
          .orderBy('category.sort', 'ASC')
          .getMany();
        if (categories.length <= 0) {
          throw new HttpException('دسته‌بندی یافت نشد', HttpStatus.NOT_FOUND);
        }

        return {
          categories,
          total: categories.length,
          currentPage: 1,
          totalPages: 1,
          statusCode: HttpStatus.OK,
        };
      }

      const [categories, total] = await this.categoryRepository
        .createQueryBuilder('category')
        .orderBy('category.sort', 'ASC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      if (categories.length <= 0) {
        throw new HttpException('دسته‌بندی یافت نشد', HttpStatus.NOT_FOUND);
      }

      return {
        categories,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error('خطا در دریافت دسته‌بندی‌ها:', error);
      throw new HttpException('مشکلی در دریافت دسته‌بندی‌ها رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new HttpException(`دسته‌بندی با شناسه ${id} پیدا نشد.`, HttpStatus.NOT_FOUND);
      }

      return {
        category,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {}
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const { title, sort } = updateCategoryDto;

      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        throw new HttpException(`دسته‌بندی با شناسه ${id} پیدا نشد.`, HttpStatus.NOT_FOUND);
      }

      const duplicate = await this.categoryRepository.findOne({
        where: [
          { title, id: Not(id) },
          { sort, id: Not(id) },
        ],
      });

      if (duplicate) {
        if (duplicate.title === title) {
          throw new HttpException(`عنوان "${title}" قبلاً استفاده شده است.`, HttpStatus.BAD_REQUEST);
        }
        if (duplicate.sort === sort) {
          throw new HttpException(`مقدار مرتب‌سازی ${sort} قبلاً استفاده شده است.`, HttpStatus.BAD_REQUEST);
        }
      }

      Object.assign(category, updateCategoryDto);
      const updatedCategory = await this.categoryRepository.save(category);

      return {
        message: 'دسته‌بندی با موفقیت به‌روزرسانی شد.',
        category: updatedCategory,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'خطایی در به‌روزرسانی دسته‌بندی رخ داده است.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const existCategory = await this.categoryRepository.findOne({
        where: {
          id,
        },
      });

      if (!existCategory) {
        throw new HttpException(`دسته‌بندی با شناسه ${id} پیدا نشد.`, HttpStatus.NOT_FOUND);
      }

      await this.categoryRepository.delete(id);

      return {
        message: `دسته‌بندی با شناسه ${id} با موفقیت حذف شد.`,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('خطایی در حذف دسته‌بندی رخ داده است.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
