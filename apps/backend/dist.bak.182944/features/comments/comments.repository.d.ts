import type { CommentStatus } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
export declare class CommentsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAudioById(id: number): Promise<{
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
    } | null>;
    findGalleryById(id: number): Promise<{
        id: number;
        createdAt: Date;
        desc: string | null;
        size: string;
        mimetype: string;
        originalName: string;
        like: number | null;
        view: number | null;
        updatedAt: Date;
    } | null>;
    createAudioComment(audioId: number, author: string, text: string): Promise<{
        id: number;
        createdAt: Date;
        audioId: number;
        text: string;
        updatedAt: Date;
        author: string;
        status: import(".prisma/client").$Enums.CommentStatus;
    }>;
    createGalleryComment(galleryId: number, author: string, text: string): Promise<{
        id: number;
        createdAt: Date;
        text: string;
        updatedAt: Date;
        author: string;
        status: import(".prisma/client").$Enums.CommentStatus;
        galleryId: number;
    }>;
    findPublishedAudioComments(audioId: number): Promise<{
        id: number;
        createdAt: Date;
        audioId: number;
        text: string;
        updatedAt: Date;
        author: string;
        status: import(".prisma/client").$Enums.CommentStatus;
    }[]>;
    findAllComments(): Promise<{
        audioComments: ({
            audio: {
                id: number;
                title: string;
            };
        } & {
            id: number;
            createdAt: Date;
            audioId: number;
            text: string;
            updatedAt: Date;
            author: string;
            status: import(".prisma/client").$Enums.CommentStatus;
        })[];
        galleryComments: ({
            gallery: {
                id: number;
                originalName: string;
            };
        } & {
            id: number;
            createdAt: Date;
            text: string;
            updatedAt: Date;
            author: string;
            status: import(".prisma/client").$Enums.CommentStatus;
            galleryId: number;
        })[];
        videoComments: ({
            video: {
                id: number;
                title: string;
            };
        } & {
            id: number;
            createdAt: Date;
            videoId: number;
            text: string;
            updatedAt: Date;
            author: string;
            status: import(".prisma/client").$Enums.CommentStatus;
        })[];
    }>;
    findAudioCommentById(id: number): Promise<{
        id: number;
        createdAt: Date;
        audioId: number;
        text: string;
        updatedAt: Date;
        author: string;
        status: import(".prisma/client").$Enums.CommentStatus;
    } | null>;
    findGalleryCommentById(id: number): Promise<{
        id: number;
        createdAt: Date;
        text: string;
        updatedAt: Date;
        author: string;
        status: import(".prisma/client").$Enums.CommentStatus;
        galleryId: number;
    } | null>;
    findVideoCommentById(id: number): Promise<{
        id: number;
        createdAt: Date;
        videoId: number;
        text: string;
        updatedAt: Date;
        author: string;
        status: import(".prisma/client").$Enums.CommentStatus;
    } | null>;
    updateAudioCommentStatus(id: number, status: CommentStatus): Promise<{
        id: number;
        createdAt: Date;
        audioId: number;
        text: string;
        updatedAt: Date;
        author: string;
        status: import(".prisma/client").$Enums.CommentStatus;
    }>;
    updateGalleryCommentStatus(id: number, status: CommentStatus): Promise<{
        id: number;
        createdAt: Date;
        text: string;
        updatedAt: Date;
        author: string;
        status: import(".prisma/client").$Enums.CommentStatus;
        galleryId: number;
    }>;
    updateVideoCommentStatus(id: number, status: CommentStatus): Promise<{
        id: number;
        createdAt: Date;
        videoId: number;
        text: string;
        updatedAt: Date;
        author: string;
        status: import(".prisma/client").$Enums.CommentStatus;
    }>;
}
