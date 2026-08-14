import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(query: PaginationDto): Promise<{
        message: string;
        data: import("@helali/shared").IPaginatedResponse<unknown>;
    }>;
    findById(id: number): Promise<{
        message: string;
        data: {
            id: number;
            title: string;
            sort: number;
        };
    }>;
    create(dto: CreateCategoryDto): Promise<{
        message: string;
        data: {
            id: number;
            title: string;
            sort: number;
        };
    }>;
    update(id: number, dto: UpdateCategoryDto): Promise<{
        message: string;
        data: {
            id: number;
            title: string;
            sort: number;
        };
    }>;
    remove(id: number): Promise<{
        message: string;
        data: null;
    }>;
}
