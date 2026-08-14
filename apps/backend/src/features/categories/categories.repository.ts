import { Injectable } from '@nestjs/common';
import type { Category, Prisma } from '@prisma/client';

import { PrismaService } from '@/shared/prisma/prisma.service';

import { PaginationDto } from '@/shared/dto/pagination.dto';

export class ListCategoriesDto extends PaginationDto {}

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTitle(title: string): Promise<Category | null> {
    return this.prisma.category.findFirst({ where: { title } });
  }

  async findBySort(sort: number): Promise<Category | null> {
    return this.prisma.category.findFirst({ where: { sort } });
  }

  async findById(id: number): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async findMany(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        orderBy: { sort: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.category.count(),
    ]);

    return { items, total };
  }

  async findAll() {
    return this.prisma.category.findMany({ orderBy: { sort: 'asc' } });
  }

  async create(data: { title: string; sort: number }): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async update(id: number, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }

  async findDuplicate(
    id: number,
    title?: string,
    sort?: number,
  ): Promise<Category | null> {
    if (sort !== undefined) {
      return this.prisma.category.findFirst({
        where: {
          OR: [
            ...(title !== undefined ? [{ title, id: { not: id } }] : []),
            { sort, id: { not: id } },
          ],
        },
      });
    }

    return this.prisma.category.findFirst({
      where: {
        title,
        id: { not: id },
      },
    });
  }

  async findByIds(ids: ReadonlyArray<number>) {
    return this.prisma.category.findMany({
      where: { id: { in: [...ids] } },
    });
  }
}
