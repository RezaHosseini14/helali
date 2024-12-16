import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';

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

  async findAll() {
    try {
      const categories = await this.categoryRepository.find({
        order: {
          sort: 'ASC',
        },
      });
      if (categories.length <= 0) {
        throw new HttpException('دسته‌بندی یافت نشد', HttpStatus.NOT_FOUND);
      }

      return {
        categories,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (error) {}
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

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
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
