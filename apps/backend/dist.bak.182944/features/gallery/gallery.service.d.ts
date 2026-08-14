import { StorageService } from '@/shared/storage/storage.service';
import type { CreateGalleryDto } from './dto/create-gallery.dto';
import { GalleryRepository } from './gallery.repository';
export declare class GalleryService {
    private readonly galleryRepository;
    private readonly storageService;
    constructor(galleryRepository: GalleryRepository, storageService: StorageService);
    upload(dto: CreateGalleryDto, file: Express.Multer.File): Promise<{
        message: string;
    }>;
    findAll(page: number, limit: number): Promise<{
        images: {
            path: string;
            id: number;
            originalName: string;
            mimetype: string;
            size: string;
            desc: string | null;
            like: number | null;
            view: number | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        currentPage: number;
        totalPages: number;
    }>;
    like(id: number): Promise<{
        message: string;
        likes: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    private mapImageWithUrl;
}
