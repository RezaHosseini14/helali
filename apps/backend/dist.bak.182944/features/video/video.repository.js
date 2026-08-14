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
exports.VideoRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const videoWithCategoriesInclude = {
    categories: {
        include: {
            category: true,
        },
    },
};
let VideoRepository = class VideoRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(page, limit) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.video.findMany({
                include: videoWithCategoriesInclude,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.video.count(),
        ]);
        return { items, total };
    }
    async findById(id) {
        return this.prisma.video.findUnique({
            where: { id },
            include: videoWithCategoriesInclude,
        });
    }
    async findStories() {
        return this.prisma.video.findMany({
            where: {
                categories: {
                    some: {
                        category: {
                            title: 'reels',
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
        return this.prisma.video.create({
            data: {
                title: data.title,
                text: data.text,
                originalName: data.originalName,
                mimetype: data.mimetype,
                size: data.size,
                posterOriginalName: data.posterOriginalName,
                posterMimetype: data.posterMimetype,
                posterSize: data.posterSize,
                categories: {
                    create: data.categoryIds.map((categoryId) => ({
                        categoryId,
                    })),
                },
            },
        });
    }
    async update(id, data) {
        return this.prisma.video.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.prisma.video.delete({ where: { id } });
    }
    async incrementLike(id) {
        return this.prisma.video.update({
            where: { id },
            data: { like: { increment: 1 } },
        });
    }
};
exports.VideoRepository = VideoRepository;
exports.VideoRepository = VideoRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VideoRepository);
//# sourceMappingURL=video.repository.js.map