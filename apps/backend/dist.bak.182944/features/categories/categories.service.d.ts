import type { IPaginatedResponse } from '@helali/shared';
import { CategoriesRepository } from './categories.repository';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly categoriesRepository;
    constructor(categoriesRepository: CategoriesRepository);
    create(dto: CreateCategoryDto): Promise<{
        message: string;
        category: {
            id: number;
            title: string;
            sort: number;
        };
    }>;
    findAll(page: number, limit: number): Promise<IPaginatedResponse<unknown>>;
    findById(id: number): Promise<{
        id: number;
        title: string;
        sort: number;
    }>;
    update(id: number, dto: UpdateCategoryDto): Promise<{
        message: string;
        category: {
            id: number;
            title: string;
            sort: number;
        };
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    validateCategoryIds(categoryIds: ReadonlyArray<number>): Promise<{
        id: number;
        title: string;
        sort: number;
    }[]>;
}
