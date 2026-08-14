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
exports.VideoController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const check_ability_decorator_1 = require("../../shared/decorators/check-ability.decorator");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const messages_1 = require("../../shared/constants/messages");
const pagination_dto_1 = require("../../shared/dto/pagination.dto");
const multer_limits_1 = require("../../shared/upload/multer-limits");
const create_video_dto_1 = require("./dto/create-video.dto");
const update_video_dto_1 = require("./dto/update-video.dto");
const video_service_1 = require("./video.service");
let VideoController = class VideoController {
    videoService;
    constructor(videoService) {
        this.videoService = videoService;
    }
    async upload(dto, files) {
        const videoFile = files.file?.[0];
        const posterFile = files.poster?.[0];
        if (!videoFile || !posterFile) {
            throw new common_1.BadRequestException(messages_1.BadRequestMessage.BothFilesRequired);
        }
        const result = await this.videoService.upload(dto, videoFile, posterFile);
        return {
            message: result.message,
            data: null,
        };
    }
    async findStories() {
        const data = await this.videoService.findStories();
        return {
            message: 'استوری‌ها دریافت شد',
            data,
        };
    }
    async findAll(query) {
        const data = await this.videoService.findAll(query.page, query.limit);
        return {
            message: 'لیست ویدیوها دریافت شد',
            data,
        };
    }
    async findById(id) {
        const data = await this.videoService.findById(id);
        return {
            message: 'ویدیو دریافت شد',
            data,
        };
    }
    async like(id) {
        const data = await this.videoService.like(id);
        return {
            message: data.message,
            data: { likes: data.likes },
        };
    }
    async update(id, dto, files) {
        const result = await this.videoService.update(id, dto, files.file?.[0], files.poster?.[0]);
        return {
            message: result.message,
            data: null,
        };
    }
    async remove(id) {
        const result = await this.videoService.remove(id);
        return {
            message: result.message,
            data: null,
        };
    }
};
exports.VideoController = VideoController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'create', subject: 'Video' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file', maxCount: 1 },
        { name: 'poster', maxCount: 1 },
    ], multer_limits_1.videoUploadMulterOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_video_dto_1.CreateVideoDto, Object]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "upload", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('stories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "findStories", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "findById", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(':id/like'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "like", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'update', subject: 'Video' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file', maxCount: 1 },
        { name: 'poster', maxCount: 1 },
    ], multer_limits_1.videoUploadMulterOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_video_dto_1.UpdateVideoDto, Object]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'delete', subject: 'Video' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "remove", null);
exports.VideoController = VideoController = __decorate([
    (0, common_1.Controller)('video'),
    __metadata("design:paramtypes", [video_service_1.VideoService])
], VideoController);
//# sourceMappingURL=video.controller.js.map