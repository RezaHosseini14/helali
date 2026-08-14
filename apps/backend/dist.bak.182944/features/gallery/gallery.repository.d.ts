import type { Gallery } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
export interface ICreateGalleryData {
    readonly desc?: string;
    readonly originalName: string;
    readonly mimetype: string;
    readonly size: string;
}
export declare class GalleryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(page: number, limit: number): Promise<{
        items: {
            id: number;
            createdAt: Date;
            desc: string | null;
            size: string;
            mimetype: string;
            originalName: string;
            like: number | null;
            view: number | null;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    findById(id: number): Promise<Gallery | null>;
    create(data: ICreateGalleryData): Promise<Gallery>;
    delete(id: number): Promise<Gallery>;
    incrementLike(id: number): Promise<Gallery>;
}
