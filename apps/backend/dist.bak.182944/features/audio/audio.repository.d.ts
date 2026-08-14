import type { Audio, Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
declare const audioWithCategoriesInclude: {
    readonly categories: {
        readonly include: {
            readonly category: true;
        };
    };
};
export type IAudioWithCategories = Prisma.AudioGetPayload<{
    include: typeof audioWithCategoriesInclude;
}>;
export interface ICreateAudioData {
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
export interface IUpdateAudioData {
    readonly title?: string;
    readonly text?: string;
    readonly originalName?: string;
    readonly mimetype?: string;
    readonly size?: string;
    readonly posterOriginalName?: string;
    readonly posterMimetype?: string;
    readonly posterSize?: string;
    readonly categoryIds?: ReadonlyArray<number>;
}
export declare class AudioRepository {
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
                audioId: number;
                categoryId: number;
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
    findById(id: number): Promise<IAudioWithCategories | null>;
    create(data: ICreateAudioData): Promise<Audio>;
    update(id: number, data: IUpdateAudioData): Promise<IAudioWithCategories>;
    delete(id: number): Promise<Audio>;
    incrementLike(id: number): Promise<Audio>;
}
export {};
