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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("../../shared/constants/messages");
const comments_repository_1 = require("./comments.repository");
let CommentsService = class CommentsService {
    commentsRepository;
    constructor(commentsRepository) {
        this.commentsRepository = commentsRepository;
    }
    async createAudioComment(dto, audioId) {
        const audio = await this.commentsRepository.findAudioById(audioId);
        if (!audio) {
            throw new common_1.NotFoundException('فایل موردنظر یافت نشد');
        }
        await this.commentsRepository.createAudioComment(audioId, dto.author, dto.text);
        return { message: messages_1.PublicMessage.CreatedComment };
    }
    async createGalleryComment(dto, galleryId) {
        const gallery = await this.commentsRepository.findGalleryById(galleryId);
        if (!gallery) {
            throw new common_1.NotFoundException('تصویر موردنظر یافت نشد');
        }
        await this.commentsRepository.createGalleryComment(galleryId, dto.author, dto.text);
        return { message: messages_1.PublicMessage.CreatedComment };
    }
    async findPublishedAudioComments(audioId) {
        try {
            const comments = await this.commentsRepository.findPublishedAudioComments(audioId);
            return {
                message: 'لیست نظرات دریافت شد',
                comments,
            };
        }
        catch {
            throw new common_1.InternalServerErrorException('خطایی رخ داد');
        }
    }
    async findAll() {
        try {
            const { audioComments, galleryComments, videoComments } = await this.commentsRepository.findAllComments();
            const comments = [
                ...audioComments.map((comment) => ({
                    id: comment.id,
                    author: comment.author,
                    text: comment.text,
                    status: comment.status,
                    type: 'audio',
                    targetId: comment.audioId,
                    targetTitle: comment.audio.title,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                })),
                ...galleryComments.map((comment) => ({
                    id: comment.id,
                    author: comment.author,
                    text: comment.text,
                    status: comment.status,
                    type: 'gallery',
                    targetId: comment.galleryId,
                    targetTitle: comment.gallery.originalName,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                })),
                ...videoComments.map((comment) => ({
                    id: comment.id,
                    author: comment.author,
                    text: comment.text,
                    status: comment.status,
                    type: 'video',
                    targetId: comment.videoId,
                    targetTitle: comment.video.title,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                })),
            ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
            return {
                message: 'لیست نظرات دریافت شد',
                comments,
                total: comments.length,
            };
        }
        catch {
            throw new common_1.InternalServerErrorException('خطایی رخ داد');
        }
    }
    async updateCommentStatus(commentId, commentType, newStatus) {
        const status = newStatus;
        if (commentType === 'audio') {
            const comment = await this.commentsRepository.findAudioCommentById(commentId);
            if (!comment) {
                throw new common_1.NotFoundException('کامنت صوتی یافت نشد');
            }
            const updated = await this.commentsRepository.updateAudioCommentStatus(commentId, status);
            return {
                message: `وضعیت کامنت به ${newStatus} تغییر یافت`,
                comment: updated,
            };
        }
        if (commentType === 'gallery') {
            const comment = await this.commentsRepository.findGalleryCommentById(commentId);
            if (!comment) {
                throw new common_1.NotFoundException('کامنت گالری یافت نشد');
            }
            const updated = await this.commentsRepository.updateGalleryCommentStatus(commentId, status);
            return {
                message: `وضعیت کامنت به ${newStatus} تغییر یافت`,
                comment: updated,
            };
        }
        if (commentType === 'video') {
            const comment = await this.commentsRepository.findVideoCommentById(commentId);
            if (!comment) {
                throw new common_1.NotFoundException('کامنت ویدیو یافت نشد');
            }
            const updated = await this.commentsRepository.updateVideoCommentStatus(commentId, status);
            return {
                message: `وضعیت کامنت به ${newStatus} تغییر یافت`,
                comment: updated,
            };
        }
        throw new common_1.BadRequestException('نوع کامنت معتبر نیست');
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [comments_repository_1.CommentsRepository])
], CommentsService);
//# sourceMappingURL=comments.service.js.map