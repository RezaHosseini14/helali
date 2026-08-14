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
exports.AudioRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const audioWithCategoriesInclude = {
    categories: {
        include: {
            category: true,
        },
    },
};
let AudioRepository = class AudioRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(page, limit) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.audio.findMany({
                include: audioWithCategoriesInclude,
                orderBy: { title: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.audio.count(),
        ]);
        return { items, total };
    }
    async findById(id) {
        return this.prisma.audio.findUnique({
            where: { id },
            include: audioWithCategoriesInclude,
        });
    }
    async create(data) {
        return this.prisma.audio.create({
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
        if (data.categoryIds) {
            await this.prisma.audioOnCategory.deleteMany({ where: { audioId: id } });
        }
        return this.prisma.audio.update({
            where: { id },
            data: {
                ...(data.title !== undefined ? { title: data.title } : {}),
                ...(data.text !== undefined ? { text: data.text } : {}),
                ...(data.originalName !== undefined ? { originalName: data.originalName } : {}),
                ...(data.mimetype !== undefined ? { mimetype: data.mimetype } : {}),
                ...(data.size !== undefined ? { size: data.size } : {}),
                ...(data.posterOriginalName !== undefined
                    ? { posterOriginalName: data.posterOriginalName }
                    : {}),
                ...(data.posterMimetype !== undefined ? { posterMimetype: data.posterMimetype } : {}),
                ...(data.posterSize !== undefined ? { posterSize: data.posterSize } : {}),
                ...(data.categoryIds
                    ? {
                        categories: {
                            create: data.categoryIds.map((categoryId) => ({ categoryId })),
                        },
                    }
                    : {}),
            },
            include: audioWithCategoriesInclude,
        });
    }
    async delete(id) {
        return this.prisma.audio.delete({ where: { id } });
    }
    async incrementLike(id) {
        return this.prisma.audio.update({
            where: { id },
            data: { like: { increment: 1 } },
        });
    }
};
exports.AudioRepository = AudioRepository;
exports.AudioRepository = AudioRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AudioRepository);
//# sourceMappingURL=audio.repository.js.map