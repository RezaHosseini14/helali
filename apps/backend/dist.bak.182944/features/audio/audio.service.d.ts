import { CategoriesRepository } from '@/features/categories/categories.repository';
import { StorageService } from '@/shared/storage/storage.service';
import { AudioRepository } from './audio.repository';
import type { CreateAudioDto } from './dto/create-audio.dto';
import type { UpdateAudioDto } from './dto/update-audio.dto';
export declare class AudioService {
    private readonly audioRepository;
    private readonly categoriesRepository;
    private readonly storageService;
    private readonly logger;
    constructor(audioRepository: AudioRepository, categoriesRepository: CategoriesRepository, storageService: StorageService);
    upload(dto: CreateAudioDto, audioFile: Express.Multer.File, posterFile: Express.Multer.File): Promise<{
        message: "فایل‌ها با موفقیت آپلود شدند";
    }>;
    findAll(page: number, limit: number): Promise<{
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
    }>;
    findById(id: number): Promise<{
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
    }>;
    like(id: number): Promise<{
        message: "با موفقیت لایک شد";
        likes: number;
    }>;
    remove(id: number): Promise<{
        message: "فایل و پوستر با موفقیت حذف شدند";
    }>;
    update(id: number, dto: UpdateAudioDto, audioFile?: Express.Multer.File, posterFile?: Express.Multer.File): Promise<{
        message: "با موفقیت به روز رسانی شد";
    }>;
    private validateCategories;
    private mapAudioWithUrls;
}
