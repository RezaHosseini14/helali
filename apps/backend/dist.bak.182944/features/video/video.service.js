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
exports.VideoService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@helali/shared");
const categories_repository_1 = require("../categories/categories.repository");
const messages_1 = require("../../shared/constants/messages");
const storage_service_1 = require("../../shared/storage/storage.service");
const image_optimize_1 = require("../../shared/upload/image-optimize");
const upload_validation_1 = require("../../shared/upload/upload-validation");
const video_repository_1 = require("./video.repository");
const PRESIGNED_URL_EXPIRY = 24 * 60 * 60;
let VideoService = class VideoService {
    videoRepository;
    categoriesRepository;
    storageService;
    constructor(videoRepository, categoriesRepository, storageService) {
        this.videoRepository = videoRepository;
        this.categoriesRepository = categoriesRepository;
        this.storageService = storageService;
    }
    async upload(dto, videoFile, posterFile) {
        const video = (0, upload_validation_1.validateUploadFile)(videoFile, 'video');
        const poster = (0, upload_validation_1.validateUploadFile)(posterFile, 'image');
        const optimizedPoster = await (0, image_optimize_1.optimizeImageToWebp)(poster.buffer);
        await this.validateCategories(dto.categories);
        const videoFileName = (0, shared_1.buildSafeStorageFileName)(video.mimetype, video.originalName);
        const posterFileName = (0, shared_1.buildSafeStorageFileName)(optimizedPoster.mimetype);
        try {
            await this.storageService.putObjects([
                {
                    bucketName: shared_1.MINIO_BUCKETS.VIDEO,
                    input: {
                        objectName: videoFileName,
                        buffer: video.buffer,
                        size: video.size,
                        mimetype: video.mimetype,
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
            await this.videoRepository.create({
                title: dto.title,
                text: dto.text ?? '',
                originalName: videoFileName,
                mimetype: video.mimetype,
                size: video.size.toString(),
                posterOriginalName: posterFileName,
                posterMimetype: optimizedPoster.mimetype,
                posterSize: optimizedPoster.size.toString(),
                categoryIds: dto.categories,
            });
            return { message: messages_1.PublicMessage.UploadedFiles };
        }
        catch (error) {
            await this.storageService.deleteFiles([
                { bucketName: shared_1.MINIO_BUCKETS.VIDEO, fileName: videoFileName },
                { bucketName: shared_1.MINIO_BUCKETS.POSTER, fileName: posterFileName },
            ]);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(messages_1.BadRequestMessage.UploadedFilesFailed);
        }
    }
    async findAll(page, limit) {
        try {
            const { items, total } = await this.videoRepository.findMany(page, limit);
            const videos = await Promise.all(items.map((item) => this.mapVideoWithUrls(item)));
            return {
                videos,
                total,
                page,
                lastPage: total === 0 ? 0 : Math.ceil(total / limit),
            };
        }
        catch {
            throw new common_1.InternalServerErrorException(messages_1.BadRequestMessage.FailedFetchingData);
        }
    }
    async findById(id) {
        try {
            const video = await this.videoRepository.findById(id);
            if (!video) {
                throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundVideo);
            }
            return {
                video: await this.mapVideoWithUrls(video),
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(messages_1.BadRequestMessage.FailedFetchingData);
        }
    }
    async findStories() {
        try {
            const stories = await this.videoRepository.findStories();
            const storiesWithPaths = await Promise.all(stories.map((story) => this.mapVideoWithUrls(story)));
            return { stories: storiesWithPaths };
        }
        catch {
            throw new common_1.InternalServerErrorException(messages_1.BadRequestMessage.FailedFetchingData);
        }
    }
    async like(id) {
        try {
            const video = await this.videoRepository.findById(id);
            if (!video) {
                throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundVideo);
            }
            const updated = await this.videoRepository.incrementLike(id);
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
            const video = await this.videoRepository.findById(id);
            if (!video) {
                throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundVideo);
            }
            await this.storageService.deleteFiles([
                { bucketName: shared_1.MINIO_BUCKETS.VIDEO, fileName: video.originalName },
                { bucketName: shared_1.MINIO_BUCKETS.POSTER, fileName: video.posterOriginalName },
            ]);
            await this.videoRepository.delete(id);
            return { message: messages_1.PublicMessage.DeletedFiles };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(messages_1.BadRequestMessage.FailedDelete);
        }
    }
    async update(id, dto, videoFile, posterFile) {
        try {
            const video = await this.videoRepository.findById(id);
            if (!video) {
                throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundVideo);
            }
            const isTitleChanged = dto.title !== undefined && video.title !== dto.title;
            const isTextChanged = dto.text !== undefined && video.text !== dto.text;
            const isVideoFileChanged = Boolean(videoFile);
            const isPosterFileChanged = Boolean(posterFile);
            if (!(isTitleChanged || isTextChanged || isVideoFileChanged || isPosterFileChanged)) {
                throw new common_1.BadRequestException(messages_1.BadRequestMessage.NoChangesDetected);
            }
            let originalName = video.originalName;
            let mimetype = video.mimetype;
            let size = video.size;
            let posterOriginalName = video.posterOriginalName;
            let posterMimetype = video.posterMimetype;
            let posterSize = video.posterSize;
            let title = video.title;
            let text = video.text;
            if (isTitleChanged && dto.title) {
                title = dto.title;
            }
            if (isTextChanged && dto.text) {
                text = dto.text;
            }
            const uploadedObjects = [];
            const previousObjects = [];
            try {
                if (videoFile) {
                    const validatedVideo = (0, upload_validation_1.validateUploadFile)(videoFile, 'video');
                    const newVideoFileName = (0, shared_1.buildSafeStorageFileName)(validatedVideo.mimetype, validatedVideo.originalName);
                    await this.storageService.putObject(shared_1.MINIO_BUCKETS.VIDEO, {
                        objectName: newVideoFileName,
                        buffer: validatedVideo.buffer,
                        size: validatedVideo.size,
                        mimetype: validatedVideo.mimetype,
                    });
                    uploadedObjects.push({ bucketName: shared_1.MINIO_BUCKETS.VIDEO, fileName: newVideoFileName });
                    previousObjects.push({ bucketName: shared_1.MINIO_BUCKETS.VIDEO, fileName: video.originalName });
                    originalName = newVideoFileName;
                    mimetype = validatedVideo.mimetype;
                    size = validatedVideo.size.toString();
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
                        fileName: video.posterOriginalName,
                    });
                    posterOriginalName = newPosterFileName;
                    posterMimetype = optimizedPoster.mimetype;
                    posterSize = optimizedPoster.size.toString();
                }
                await this.videoRepository.update(id, {
                    title,
                    text,
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
    async mapVideoWithUrls(video) {
        const [path, posterPath] = await Promise.all([
            this.storageService.getPresignedUrl(shared_1.MINIO_BUCKETS.VIDEO, video.originalName, PRESIGNED_URL_EXPIRY),
            this.storageService.getPresignedUrl(shared_1.MINIO_BUCKETS.POSTER, video.posterOriginalName, PRESIGNED_URL_EXPIRY),
        ]);
        return {
            ...video,
            categories: video.categories?.map((item) => item.categoryId),
            path,
            posterPath,
        };
    }
};
exports.VideoService = VideoService;
exports.VideoService = VideoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [video_repository_1.VideoRepository,
        categories_repository_1.CategoriesRepository,
        storage_service_1.StorageService])
], VideoService);
//# sourceMappingURL=video.service.js.map