import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Pagination } from 'src/common/decorator/pagination.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve a paginated list of categories' })
  @ApiResponse({
    status: 200,
    description: 'Paginated category list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Category 1' },
              sort: { type: 'number', example: 1 },
            },
          },
        },
        total: { type: 'number', example: 50 },
        currentPage: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  async findAll(@Pagination() pagination: { limit: number; page: number }) {
    const { limit, page } = pagination;
    return await this.categoryService.findAll(limit, page);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.categoryService.remove(+id);
  }
}
