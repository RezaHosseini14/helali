import type { Prisma, Video } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
declare const videoWithCategoriesInclude: {
    readonly categories: {
        readonly include: {
            readonly category: true;
        };
    };
};
export type IVideoWithCategories = Prisma.VideoGetPayload<{
    include: typeof videoWithCategoriesInclude;
}>;
export interface ICreateVideoData {
    readonly title: string;
    readonly text: string;
    readonly originalName: string;
    readonly mimetype: string;
    readonly size: string;
    readonly posterOriginalName: string;
    readonly posterMimetype: string;
    readonly posterSize: string;
    readonly categoryIds: ReadonlyArray<number>;
}
export interface IUpdateVideoData {
    readonly title?: string;
    readonly text?: string;
    readonly originalName?: string;
    readonly mimetype?: string;
    readonly size?: string;
    readonly posterOriginalName?: string;
    readonly posterMimetype?: string;
    readonly posterSize?: string;
}
export declare class VideoRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(page: number, limit: number): Promise<{
        items: ({
            categories: ({
                category: {
                    id: number;
                    title: string;
                    sort: number;
                };
            } & {
                categoryId: number;
                videoId: number;
            })[];
        } & {
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
        })[];
        total: number;
    }>;
    findById(id: number): Promise<IVideoWithCategories | null>;
    findStories(): Promise<{
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
    }[]>;
    create(data: ICreateVideoData): Promise<Video>;
    update(id: number, data: IUpdateVideoData): Promise<Video>;
    delete(id: number): Promise<Video>;
    incrementLike(id: number): Promise<Video>;
}
export {};
