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
var AudioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@helali/shared");
const categories_repository_1 = require("../categories/categories.repository");
const messages_1 = require("../../shared/constants/messages");
const storage_service_1 = require("../../shared/storage/storage.service");
const image_optimize_1 = require("../../shared/upload/image-optimize");
const upload_validation_1 = require("../../shared/upload/upload-validation");
const audio_repository_1 = require("./audio.repository");
const PRESIGNED_URL_EXPIRY = 24 * 60 * 60;
let AudioService = AudioService_1 = class AudioService {
    audioRepository;
    categoriesRepository;
    storageService;
    logger = new common_1.Logger(AudioService_1.name);
    constructor(audioRepository, categoriesRepository, storageService) {
        this.audioRepository = audioRepository;
        this.categoriesRepository = categoriesRepository;
        this.storageService = storageService;
    }
    async upload(dto, audioFile, posterFile) {
        const audio = (0, upload_validation_1.validateUploadFile)(audioFile, 'audio');
        const poster = (0, upload_validation_1.validateUploadFile)(posterFile, 'image');
        let optimizedPoster;
        try {
            optimizedPoster = await (0, image_optimize_1.optimizeImageToWebp)(poster.buffer);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'unknown';
            this.logger.error(`Poster optimize failed: ${message}`);
            throw new common_1.BadRequestException('بهینه‌سازی تصویر پوستر ناموفق بود');
        }
        await this.validateCategories(dto.categories);
        const audioFileName = (0, shared_1.buildSafeStorageFileName)(audio.mimetype, audio.originalName);
        const posterFileName = (0, shared_1.buildSafeStorageFileName)(optimizedPoster.mimetype);
        try {
            await this.storageService.putObjects([
                {
                    bucketName: shared_1.MINIO_BUCKETS.AUDIO,
                    input: {
                        objectName: audioFileName,
                        buffer: audio.buffer,
                        size: audio.size,
                        mimetype: audio.mimetype,
                    },
                },
                {
                    bucketName: shared_1.MINIO_BUCKETS.POSTER,
                    input: {
                        objectName: posterFileName,
                        buffer: optimizedPoster.buffer,
                        size: optimizedPoster.size,
                        mimetype: optimizedPoster.mimetype,
                    },
                },
            ]);
            await this.audioRepository.create({
                title: dto.title,
                text: dto.text ?? '',
                originalName: audioFileName,
                mimetype: audio.mimetype,
                size: audio.size.toString(),
                posterOriginalName: posterFileName,
                posterMimetype: optimizedPoster.mimetype,
                posterSize: optimizedPoster.size.toString(),
                categoryIds: dto.categories,
            });
            return { message: messages_1.PublicMessage.UploadedFiles };
        }
        catch (error) {
            await this.storageService.deleteFiles([
                { bucketName: shared_1.MINIO_BUCKETS.AUDIO, fileName: audioFileName },
                { bucketName: shared_1.MINIO_BUCKETS.POSTER, fileName: posterFileName },
            ]);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            const message = error instanceof Error ? error.message : 'unknown';
            this.logger.error(`Audio upload failed: ${message}`);
            throw new common_1.InternalServerErrorException(messages_1.BadRequestMessage.UploadedFilesFailed);
        }
    }
    async findAll(page, limit) {
        try {
            const { items, total } = await this.audioRepository.findMany(page, limit);
            const audios = await Promise.all(items.map((item) => this.mapAudioWithUrls(item)));
            return {
                audios,
                total,
                currentPage: page,
                totalPages: total === 0 ? 0 : Math.ceil(total / limit),
            };
        }
        catch {
            throw new common_1.InternalServerErrorException(messages_1.BadRequestMessage.FailedFetchingData);
        }
    }
    async findById(id) {
        try {
            const audio = await this.audioRepository.findById(id);
            if (!audio) {
                throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundAudio);
            }
            return {
                audio: await this.mapAudioWithUrls(audio),
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(messages_1.BadRequestMessage.FailedFetchingData);
        }
    }
    async like(id) {
        try {
            const audio = await this.audioRepository.findById(id);
            if (!audio) {
                throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundAudio);
            }
            const updated = await this.audioRepository.incrementLike(id);
            return {
                message: messages_1.PublicMessage.Like,
                likes: updated.like,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(messages_1.BadRequestMessage.FailedLike);
        }
    }
    async remove(id) {
        try {
            const audio = await this.audioRepository.findById(id);
            if (!audio) {
                throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundAudio);
            }
            await this.storageService.deleteFiles([
                { bucketName: shared_1.MINIO_BUCKETS.AUDIO, fileName: audio.originalName },
                { bucketName: shared_1.MINIO_BUCKETS.POSTER, fileName: audio.posterOriginalName },
            ]);
            await this.audioRepository.delete(id);
            return { message: messages_1.PublicMessage.DeletedFiles };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('مشکلی در حذف فایل رخ داد');
        }
    }
    async update(id, dto, audioFile, posterFile) {
        try {
            const audio = await this.audioRepository.findById(id);
            if (!audio) {
                throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundAudio);
            }
            if (dto.categories) {
                await this.validateCategories(dto.categories);
            }
            let originalName = audio.originalName;
            let mimetype = audio.mimetype;
            let size = audio.size;
            let posterOriginalName = audio.posterOriginalName;
            let posterMimetype = audio.posterMimetype;
            let posterSize = audio.posterSize;
            const uploadedObjects = [];
            const previousObjects = [];
            try {
                if (audioFile) {
                    const validatedAudio = (0, upload_validation_1.validateUploadFile)(audioFile, 'audio');
                    const newAudioFileName = (0, shared_1.buildSafeStorageFileName)(validatedAudio.mimetype, validatedAudio.originalName);
                    await this.storageService.putObject(shared_1.MINIO_BUCKETS.AUDIO, {
                        objectName: newAudioFileName,
                        buffer: validatedAudio.buffer,
                        size: validatedAudio.size,
                        mimetype: validatedAudio.mimetype,
                    });
                    uploadedObjects.push({ bucketName: shared_1.MINIO_BUCKETS.AUDIO, fileName: newAudioFileName });
                    previousObjects.push({ bucketName: shared_1.MINIO_BUCKETS.AUDIO, fileName: audio.originalName });
                    originalName = newAudioFileName;
                    mimetype = validatedAudio.mimetype;
                    size = validatedAudio.size.toString();
                }
                if (posterFile) {
                    const validatedPoster = (0, upload_validation_1.validateUploadFile)(posterFile, 'image');
                    const optimizedPoster = await (0, image_optimize_1.optimizeImageToWebp)(validatedPoster.buffer);
                    const newPosterFileName = (0, shared_1.buildSafeStorageFileName)(optimizedPoster.mimetype);
                    await this.storageService.putObject(shared_1.MINIO_BUCKETS.POSTER, {
                        objectName: newPosterFileName,
                        buffer: optimizedPoster.buffer,
                        size: optimizedPoster.size,
                        mimetype: optimizedPoster.mimetype,
                    });
                    uploadedObjects.push({ bucketName: shared_1.MINIO_BUCKETS.POSTER, fileName: newPosterFileName });
                    previousObjects.push({
                        bucketName: shared_1.MINIO_BUCKETS.POSTER,
                        fileName: audio.posterOriginalName,
                    });
                    posterOriginalName = newPosterFileName;
                    posterMimetype = optimizedPoster.mimetype;
                    posterSize = optimizedPoster.size.toString();
                }
                await this.audioRepository.update(id, {
                    ...(dto.title !== undefined ? { title: dto.title } : {}),
                    ...(dto.text !== undefined ? { text: dto.text } : {}),
                    ...(dto.categories !== undefined ? { categoryIds: dto.categories } : {}),
                    originalName,
                    mimetype,
                    size,
                    posterOriginalName,
                    posterMimetype,
                    posterSize,
                });
                if (previousObjects.length > 0) {
                    await this.storageService.deleteFiles(previousObjects);
                }
                return { message: messages_1.PublicMessage.Updated };
            }
            catch (innerError) {
                if (uploadedObjects.length > 0) {
                    await this.storageService.deleteFiles(uploadedObjects);
                }
                throw innerError;
            }
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(messages_1.BadRequestMessage.FailedUpdate);
        }
    }
    async validateCategories(categoryIds) {
        const categories = await this.categoriesRepository.findByIds(categoryIds);
        if (categories.length !== categoryIds.length) {
            throw new common_1.BadRequestException(messages_1.BadRequestMessage.InvalidCategories);
        }
    }
    async mapAudioWithUrls(audio) {
        const [path, posterPath] = await Promise.all([
            this.storageService.getPresignedUrl(shared_1.MINIO_BUCKETS.AUDIO, audio.originalName, PRESIGNED_URL_EXPIRY),
            this.storageService.getPresignedUrl(shared_1.MINIO_BUCKETS.POSTER, audio.posterOriginalName, PRESIGNED_URL_EXPIRY),
        ]);
        return {
            id: audio.id,
            title: audio.title,
            originalName: audio.originalName,
            mimetype: audio.mimetype,
            size: audio.size,
            text: audio.text,
            posterOriginalName: audio.posterOriginalName,
            posterMimetype: audio.posterMimetype,
            posterSize: audio.posterSize,
            like: audio.like,
            view: audio.view,
            createdAt: audio.createdAt,
            updatedAt: audio.updatedAt,
            categories: audio.categories.map((item) => item.categoryId),
            path,
            posterPath,
        };
    }
};
exports.AudioService = AudioService;
exports.AudioService = AudioService = AudioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audio_repository_1.AudioRepository,
        categories_repository_1.CategoriesRepository,
        storage_service_1.StorageService])
], AudioService);
//# sourceMappingURL=audio.service.js.map