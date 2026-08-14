"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const categories_repository_1 = require("./categories.repository");
let CategoriesService = class CategoriesService {
    categoriesRepository;
    constructor(categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }
    async create(dto) {
        const existingTitle = await this.categoriesRepository.findByTitle(dto.title);
        if (existingTitle) {
            throw new common_1.BadRequestException(`عنوان "${dto.title}" قبلاً استفاده شده است.`);
        }
        const existingSort = await this.categoriesRepository.findBySort(dto.sort);
        if (existingSort) {
            throw new common_1.BadRequestException(`مقدار مرتب‌سازی ${dto.sort} قبلاً استفاده شده است.`);
        }
        const category = await this.categoriesRepository.create(dto);
        return {
            message: 'دسته‌بندی با موفقیت اضافه شد',
            category,
        };
    }
    async findAll(page, limit) {
        const { items, total } = await this.categoriesRepository.findMany(page, limit);
        if (items.length === 0) {
            throw new common_1.NotFoundException('دسته‌بندی یافت نشد');
        }
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`دسته‌بندی با شناسه ${id} پیدا نشد.`);
        }
        return category;
    }
    async update(id, dto) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`دسته‌بندی با شناسه ${id} پیدا نشد.`);
        }
        if (dto.title !== undefined || dto.sort !== undefined) {
            const duplicate = await this.categoriesRepository.findDuplicate(id, dto.title, dto.sort);
            if (duplicate) {
                if (duplicate.title === dto.title) {
                    throw new common_1.BadRequestException(`عنوان "${dto.title}" قبلاً استفاده شده است.`);
                }
                if (duplicate.sort === dto.sort) {
                    throw new common_1.BadRequestException(`مقدار مرتب‌سازی ${dto.sort} قبلاً استفاده شده است.`);
                }
            }
        }
        const updated = await this.categoriesRepository.update(id, dto);
        return {
            message: 'دسته‌بندی با موفقیت به‌روزرسانی شد',
            category: updated,
        };
    }
    async remove(id) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`دسته‌بندی با شناسه ${id} پیدا نشد.`);
        }
        await this.categoriesRepository.delete(id);
        return {
            message: `دسته‌بندی با شناسه ${id} با موفقیت حذف شد`,
        };
    }
    async validateCategoryIds(categoryIds) {
        const categories = await this.categoriesRepository.findByIds(categoryIds);
        if (categories.length !== categoryIds.length) {
            throw new common_1.BadRequestException('دسته بندی ها را به درستی وارد کنید');
        }
        return categories;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [categories_repository_1.CategoriesRepository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map