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
exports.GalleryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const check_ability_decorator_1 = require("../../shared/decorators/check-ability.decorator");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const messages_1 = require("../../shared/constants/messages");
const pagination_dto_1 = require("../../shared/dto/pagination.dto");
const multer_limits_1 = require("../../shared/upload/multer-limits");
const create_gallery_dto_1 = require("./dto/create-gallery.dto");
const gallery_service_1 = require("./gallery.service");
let GalleryController = class GalleryController {
    galleryService;
    constructor(galleryService) {
        this.galleryService = galleryService;
    }
    async upload(dto, file) {
        if (!file) {
            throw new common_1.BadRequestException(messages_1.BadRequestMessage.ImageRequired);
        }
        const result = await this.galleryService.upload(dto, file);
        return {
            message: result.message,
            data: null,
        };
    }
    async findAll(query) {
        const data = await this.galleryService.findAll(query.page, query.limit);
        return {
            message: 'تصاویر دریافت شد',
            data,
        };
    }
    async like(id) {
        const data = await this.galleryService.like(id);
        return {
            message: data.message,
            data: { likes: data.likes },
        };
    }
    async remove(id) {
        const result = await this.galleryService.remove(id);
        return {
            message: result.message,
            data: null,
        };
    }
};
exports.GalleryController = GalleryController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'create', subject: 'Gallery' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_limits_1.galleryUploadMulterOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_gallery_dto_1.CreateGalleryDto, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "upload", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(':id/like'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "like", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'delete', subject: 'Gallery' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "remove", null);
exports.GalleryController = GalleryController = __decorate([
    (0, common_1.Controller)('gallery'),
    __metadata("design:paramtypes", [gallery_service_1.GalleryService])
], GalleryController);
//# sourceMappingURL=gallery.controller.js.map