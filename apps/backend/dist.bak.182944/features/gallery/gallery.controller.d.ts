import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { GalleryService } from './gallery.service';
export declare class GalleryController {
    private readonly galleryService;
    constructor(galleryService: GalleryService);
    upload(dto: CreateGalleryDto, file: Express.Multer.File): Promise<{
        message: string;
        data: null;
    }>;
    findAll(query: PaginationDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    like(id: number): Promise<{
        message: string;
        data: {
            likes: number | null;
        };
    }>;
    remove(id: number): Promise<{
        message: string;
        data: null;
    }>;
}
