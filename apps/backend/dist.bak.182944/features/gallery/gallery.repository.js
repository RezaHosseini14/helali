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
exports.GalleryRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let GalleryRepository = class GalleryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(page, limit) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.gallery.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.gallery.count(),
        ]);
        return { items, total };
    }
    async findById(id) {
        return this.prisma.gallery.findUnique({ where: { id } });
    }
    async create(data) {
        return this.prisma.gallery.create({
            data: {
                desc: data.desc,
                originalName: data.originalName,
                mimetype: data.mimetype,
                size: data.size,
            },
        });
    }
    async delete(id) {
        return this.prisma.gallery.delete({ where: { id } });
    }
    async incrementLike(id) {
        const gallery = await this.prisma.gallery.findUnique({ where: { id } });
        if (!gallery) {
            throw new Error('Gallery not found');
        }
        return this.prisma.gallery.update({
            where: { id },
            data: { like: (gallery.like ?? 0) + 1 },
        });
    }
};
exports.GalleryRepository = GalleryRepository;
exports.GalleryRepository = GalleryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GalleryRepository);
//# sourceMappingURL=gallery.repository.js.map