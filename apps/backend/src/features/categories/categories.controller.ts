import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CheckAbility } from '@/shared/decorators/check-ability.decorator';
import { Public } from '@/shared/decorators/public.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  async findAll(@Query() query: PaginationDto) {
    const data = await this.categoriesService.findAll(query.page, query.limit);

    return {
      message: 'دسته‌بندی‌ها دریافت شد',
      data,
    };
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.categoriesService.findById(id);

    return {
      message: 'دسته‌بندی دریافت شد',
      data,
    };
  }

  @Post()
  @CheckAbility({ action: 'manage', subject: 'Category' })
  async create(@Body() dto: CreateCategoryDto) {
    const result = await this.categoriesService.create(dto);

    return {
      message: result.message,
      data: result.category,
    };
  }

  @Patch(':id')
  @CheckAbility({ action: 'manage', subject: 'Category' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    const result = await this.categoriesService.update(id, dto);

    return {
      message: result.message,
      data: result.category,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckAbility({ action: 'manage', subject: 'Category' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.categoriesService.remove(id);

    return {
      message: result.message,
      data: null,
    };
  }
}
