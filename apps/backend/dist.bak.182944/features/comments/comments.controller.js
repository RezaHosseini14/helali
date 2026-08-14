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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsController = void 0;
const common_1 = require("@nestjs/common");
const check_ability_decorator_1 = require("../../shared/decorators/check-ability.decorator");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const comments_service_1 = require("./comments.service");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const update_comment_status_dto_1 = require("./dto/update-comment-status.dto");
let CommentsController = class CommentsController {
    commentsService;
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    async createAudioComment(dto, audioId) {
        const result = await this.commentsService.createAudioComment(dto, audioId);
        return {
            message: result.message,
            data: null,
        };
    }
    async createGalleryComment(dto, galleryId) {
        const result = await this.commentsService.createGalleryComment(dto, galleryId);
        return {
            message: result.message,
            data: null,
        };
    }
    async findAudioComments(audioId) {
        const data = await this.commentsService.findPublishedAudioComments(audioId);
        return {
            message: data.message,
            data: { comments: data.comments },
        };
    }
    async findAll() {
        const data = await this.commentsService.findAll();
        return {
            message: data.message,
            data: {
                comments: data.comments,
                total: data.total,
            },
        };
    }
    async updateCommentStatus(type, id, dto) {
        const data = await this.commentsService.updateCommentStatus(id, type, dto.newStatus);
        return {
            message: data.message,
            data: data.comment,
        };
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('audio/:audioId'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('audioId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_comment_dto_1.CreateCommentDto, Number]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "createAudioComment", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('gallery/:galleryId'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('galleryId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_comment_dto_1.CreateCommentDto, Number]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "createGalleryComment", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('audio/:audioId'),
    __param(0, (0, common_1.Param)('audioId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "findAudioComments", null);
__decorate([
    (0, common_1.Get)(),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'manage', subject: 'Comment' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':type/:id/status'),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'manage', subject: 'Comment' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, update_comment_status_dto_1.UpdateCommentStatusDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "updateCommentStatus", null);
exports.CommentsController = CommentsController = __decorate([
    (0, common_1.Controller)('comments'),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsController);
//# sourceMappingURL=comments.controller.js.map