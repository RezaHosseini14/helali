import { PaginationDto } from '@/shared/dto/pagination.dto';
import { AudioService } from './audio.service';
import { CreateAudioDto } from './dto/create-audio.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';
export declare class AudioController {
    private readonly audioService;
    constructor(audioService: AudioService);
    upload(dto: CreateAudioDto, files: {
        file?: Express.Multer.File[];
        poster?: Express.Multer.File[];
    }): Promise<{
        message: "فایل‌ها با موفقیت آپلود شدند";
        data: null;
    }>;
    findAll(query: PaginationDto): Promise<{
        message: string;
        data: {
            audios: {
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
                categories: number[];
                path: string;
                posterPath: string;
            }[];
            total: number;
            currentPage: number;
            totalPages: number;
        };
    }>;
    findById(id: number): Promise<{
        message: string;
        data: {
            audio: {
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
                categories: number[];
                path: string;
                posterPath: string;
            };
        };
    }>;
    like(id: number): Promise<{
        message: "با موفقیت لایک شد";
        data: {
            likes: number;
        };
    }>;
    update(id: number, dto: UpdateAudioDto, files: {
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
