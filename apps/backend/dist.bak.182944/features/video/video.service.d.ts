import { CategoriesRepository } from '@/features/categories/categories.repository';
import { StorageService } from '@/shared/storage/storage.service';
import type { CreateVideoDto } from './dto/create-video.dto';
import type { UpdateVideoDto } from './dto/update-video.dto';
import { VideoRepository } from './video.repository';
export declare class VideoService {
    private readonly videoRepository;
    private readonly categoriesRepository;
    private readonly storageService;
    constructor(videoRepository: VideoRepository, categoriesRepository: CategoriesRepository, storageService: StorageService);
    upload(dto: CreateVideoDto, videoFile: Express.Multer.File, posterFile: Express.Multer.File): Promise<{
        message: "فایل‌ها با موفقیت آپلود شدند";
    }>;
    findAll(page: number, limit: number): Promise<{
        videos: ({
            categories: number[] | undefined;
            path: string;
            posterPath: string;
            id: number;
            createdAt: Date;
            title: string;
            size: string;
            mimetype: string;
            originalName: string;
            text: string;
            posterOriginalName: string;
            posterMimetype: string;
            posterSize: string;
            like: number;
            view: number;
            updatedAt: Date;
        } | {
            categories: number[] | undefined;
            path: string;
            posterPath: string;
            id: number;
            title: string;
            originalName: string;
            mimetype: string;
            size: string;
            text: string;
            posterOriginalName: string;
            posterMimetype: string;
            posterSize: string;
            like: number;
            view: number;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    findById(id: number): Promise<{
        video: {
            categories: number[] | undefined;
            path: string;
            posterPath: string;
            id: number;
            createdAt: Date;
            title: string;
            size: string;
            mimetype: string;
            originalName: string;
            text: string;
            posterOriginalName: string;
            posterMimetype: string;
            posterSize: string;
            like: number;
            view: number;
            updatedAt: Date;
        } | {
            categories: number[] | undefined;
            path: string;
            posterPath: string;
            id: number;
            title: string;
            originalName: string;
            mimetype: string;
            size: string;
            text: string;
            posterOriginalName: string;
            posterMimetype: string;
            posterSize: string;
            like: number;
            view: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    findStories(): Promise<{
        stories: ({
            categories: number[] | undefined;
            path: string;
            posterPath: string;
            id: number;
            createdAt: Date;
            title: string;
            size: string;
            mimetype: string;
            originalName: string;
            text: string;
            posterOriginalName: string;
            posterMimetype: string;
            posterSize: string;
            like: number;
            view: number;
            updatedAt: Date;
        } | {
            categories: number[] | undefined;
            path: string;
            posterPath: string;
            id: number;
            title: string;
            originalName: string;
            mimetype: string;
            size: string;
            text: string;
            posterOriginalName: string;
            posterMimetype: string;
            posterSize: string;
            like: number;
            view: number;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    like(id: number): Promise<{
        message: "با موفقیت لایک شد";
        likes: number;
    }>;
    remove(id: number): Promise<{
        message: "فایل و پوستر با موفقیت حذف شدند";
    }>;
    update(id: number, dto: UpdateVideoDto, videoFile?: Express.Multer.File, posterFile?: Express.Multer.File): Promise<{
        message: "با موفقیت به روز رسانی شد";
    }>;
    private validateCategories;
    private mapVideoWithUrls;
}
