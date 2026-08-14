import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoService } from './video.service';
export declare class VideoController {
    private readonly videoService;
    constructor(videoService: VideoService);
    upload(dto: CreateVideoDto, files: {
        file?: Express.Multer.File[];
        poster?: Express.Multer.File[];
    }): Promise<{
        message: "فایل‌ها با موفقیت آپلود شدند";
        data: null;
    }>;
    findStories(): Promise<{
        message: string;
        data: {
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
        };
    }>;
    findAll(query: PaginationDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    findById(id: number): Promise<{
        message: string;
        data: {
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
        };
    }>;
    like(id: number): Promise<{
        message: "با موفقیت لایک شد";
        data: {
            likes: number;
        };
    }>;
    update(id: number, dto: UpdateVideoDto, files: {
        file?: Express.Multer.File[];
        poster?: Express.Multer.File[];
    }): Promise<{
        message: "با موفقیت به روز رسانی شد";
        data: null;
    }>;
    remove(id: number): Promise<{
        message: "فایل و پوستر با موفقیت حذف شدند";
        data: null;
    }>;
}
