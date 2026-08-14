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
exports.GalleryService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@helali/shared");
const messages_1 = require("../../shared/constants/messages");
const storage_service_1 = require("../../shared/storage/storage.service");
const image_optimize_1 = require("../../shared/upload/image-optimize");
const upload_validation_1 = require("../../shared/upload/upload-validation");
const gallery_repository_1 = require("./gallery.repository");
const PRESIGNED_URL_EXPIRY = 24 * 60 * 60;
let GalleryService = class GalleryService {
    galleryRepository;
    storageService;
    constructor(galleryRepository, storageService) {
        this.galleryRepository = galleryRepository;
        this.storageService = storageService;
    }
    async upload(dto, file) {
        const validated = (0, upload_validation_1.validateUploadFile)(file, 'image');
        const optimized = await (0, image_optimize_1.optimizeImageToWebp)(validated.buffer);
        const objectName = (0, shared_1.buildSafeStorageFileName)(optimized.mimetype);
        try {
            await this.storageService.putObject(shared_1.MINIO_BUCKETS.GALLERY, {
                objectName,
                buffer: optimized.buffer,
                size: optimized.size,
                mimetype: optimized.mimetype,
            });
            await this.galleryRepository.create({
                desc: dto.desc,
                originalName: objectName,
                mimetype: optimized.mimetype,
                size: optimized.size.toString(),
            });
            return { message: 'فایل‌ها با موفقیت آپلود شد' };
        }
        catch (error) {
            await this.storageService.deleteFiles([
                { bucketName: shared_1.MINIO_BUCKETS.GALLERY, fileName: objectName },
            ]);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('مشکلی در آپلود تصویر رخ داد');
        }
    }
    async findAll(page, limit) {
        try {
            const { items, total } = await this.galleryRepository.findMany(page, limit);
            const images = await Promise.all(items.map((image) => this.mapImageWithUrl(image)));
            return {
                images,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch {
            throw new common_1.InternalServerErrorException('مشکلی در دریافت تصاویر رخ داد');
        }
    }
    async like(id) {
        const image = await this.galleryRepository.findById(id);
        if (!image) {
            throw new common_1.NotFoundException('فایل موردنظر یافت نشد');
        }
        const updated = await this.galleryRepository.incrementLike(id);
        return {
            message: 'لایک ثبت شد',
            likes: updated.like,
        };
    }
    async remove(id) {
        const image = await this.galleryRepository.findById(id);
        if (!image) {
            throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundImage);
        }
        await this.storageService.deleteFile(shared_1.MINIO_BUCKETS.GALLERY, image.originalName);
        await this.galleryRepository.delete(id);
        return { message: 'تصویر حذف شد' };
    }
    async mapImageWithUrl(image) {
        const path = await this.storageService.getPresignedUrl(shared_1.MINIO_BUCKETS.GALLERY, image.originalName, PRESIGNED_URL_EXPIRY);
        return {
            ...image,
            path,
        };
    }
};
exports.GalleryService = GalleryService;
exports.GalleryService = GalleryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gallery_repository_1.GalleryRepository,
        storage_service_1.StorageService])
], GalleryService);
//# sourceMappingURL=gallery.service.js.map