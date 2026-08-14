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
exports.CommentsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let CommentsRepository = class CommentsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAudioById(id) {
        return this.prisma.audio.findUnique({ where: { id } });
    }
    async findGalleryById(id) {
        return this.prisma.gallery.findUnique({ where: { id } });
    }
    async createAudioComment(audioId, author, text) {
        return this.prisma.audioComment.create({
            data: { audioId, author, text },
        });
    }
    async createGalleryComment(galleryId, author, text) {
        return this.prisma.galleryComment.create({
            data: { galleryId, author, text },
        });
    }
    async findPublishedAudioComments(audioId) {
        return this.prisma.audioComment.findMany({
            where: {
                audioId,
                status: 'published',
            },
            orderBy: { id: 'desc' },
        });
    }
    async findAllComments() {
        const [audioComments, galleryComments, videoComments] = await Promise.all([
            this.prisma.audioComment.findMany({
                orderBy: { createdAt: 'desc' },
                include: { audio: { select: { id: true, title: true } } },
            }),
            this.prisma.galleryComment.findMany({
                orderBy: { createdAt: 'desc' },
                include: { gallery: { select: { id: true, originalName: true } } },
            }),
            this.prisma.videoComment.findMany({
                orderBy: { createdAt: 'desc' },
                include: { video: { select: { id: true, title: true } } },
            }),
        ]);
        return { audioComments, galleryComments, videoComments };
    }
    async findAudioCommentById(id) {
        return this.prisma.audioComment.findUnique({ where: { id } });
    }
    async findGalleryCommentById(id) {
        return this.prisma.galleryComment.findUnique({ where: { id } });
    }
    async findVideoCommentById(id) {
        return this.prisma.videoComment.findUnique({ where: { id } });
    }
    async updateAudioCommentStatus(id, status) {
        return this.prisma.audioComment.update({
            where: { id },
            data: { status },
        });
    }
    async updateGalleryCommentStatus(id, status) {
        return this.prisma.galleryComment.update({
            where: { id },
            data: { status },
        });
    }
    async updateVideoCommentStatus(id, status) {
        return this.prisma.videoComment.update({
            where: { id },
            data: { status },
        });
    }
};
exports.CommentsRepository = CommentsRepository;
exports.CommentsRepository = CommentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentsRepository);
//# sourceMappingURL=comments.repository.js.map