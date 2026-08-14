import { CommentsRepository } from './comments.repository';
import type { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsService {
    private readonly commentsRepository;
    constructor(commentsRepository: CommentsRepository);
    createAudioComment(dto: CreateCommentDto, audioId: number): Promise<{
        message: "نظر شما ثبت شد";
    }>;
    createGalleryComment(dto: CreateCommentDto, galleryId: number): Promise<{
        message: "نظر شما ثبت شد";
    }>;
    findPublishedAudioComments(audioId: number): Promise<{
        message: string;
        comments: {
            id: number;
            createdAt: Date;
            audioId: number;
            text: string;
            updatedAt: Date;
            author: string;
            status: import(".prisma/client").$Enums.CommentStatus;
        }[];
    }>;
    findAll(): Promise<{
        message: string;
        comments: ({
            id: number;
            author: string;
            text: string;
            status: import(".prisma/client").$Enums.CommentStatus;
            type: "audio";
            targetId: number;
            targetTitle: string;
            createdAt: Date;
            updatedAt: Date;
        } | {
            id: number;
            author: string;
            text: string;
            status: import(".prisma/client").$Enums.CommentStatus;
            type: "gallery";
            targetId: number;
            targetTitle: string;
            createdAt: Date;
            updatedAt: Date;
        } | {
            id: number;
            author: string;
            text: string;
            status: import(".prisma/client").$Enums.CommentStatus;
            type: "video";
            targetId: number;
            targetTitle: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
    }>;
    updateCommentStatus(commentId: number, commentType: 'audio' | 'gallery' | 'video', newStatus: string): Promise<{
        message: string;
        comment: {
            id: number;
            createdAt: Date;
            audioId: number;
            text: string;
            updatedAt: Date;
            author: string;
            status: import(".prisma/client").$Enums.CommentStatus;
        };
    } | {
        message: string;
        comment: {
            id: number;
            createdAt: Date;
            text: string;
            updatedAt: Date;
            author: string;
            status: import(".prisma/client").$Enums.CommentStatus;
            galleryId: number;
        };
    } | {
        message: string;
        comment: {
            id: number;
            createdAt: Date;
            videoId: number;
            text: string;
            updatedAt: Date;
            author: string;
            status: import(".prisma/client").$Enums.CommentStatus;
        };
    }>;
}
