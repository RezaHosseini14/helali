import type { Category, Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PaginationDto } from '@/shared/dto/pagination.dto';
export declare class ListCategoriesDto extends PaginationDto {
}
export declare class CategoriesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByTitle(title: string): Promise<Category | null>;
    findBySort(sort: number): Promise<Category | null>;
    findById(id: number): Promise<Category | null>;
    findMany(page: number, limit: number): Promise<{
        items: {
            id: number;
            title: string;
            sort: number;
        }[];
        total: number;
    }>;
    findAll(): Promise<{
        id: number;
        title: string;
        sort: number;
    }[]>;
    create(data: {
        title: string;
        sort: number;
    }): Promise<Category>;
    update(id: number, data: Prisma.CategoryUpdateInput): Promise<Category>;
    delete(id: number): Promise<Category>;
    findDuplicate(id: number, title?: string, sort?: number): Promise<Category | null>;
    findByIds(ids: ReadonlyArray<number>): Promise<{
        id: number;
        title: string;
        sort: number;
    }[]>;
}
