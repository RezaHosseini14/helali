import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentStatusDto } from './dto/update-comment-status.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    createAudioComment(dto: CreateCommentDto, audioId: number): Promise<{
        message: "نظر شما ثبت شد";
        data: null;
    }>;
    createGalleryComment(dto: CreateCommentDto, galleryId: number): Promise<{
        message: "نظر شما ثبت شد";
        data: null;
    }>;
    findAudioComments(audioId: number): Promise<{
        message: string;
        data: {
            comments: {
                id: number;
                createdAt: Date;
                audioId: number;
                text: string;
                updatedAt: Date;
                author: string;
                status: import(".prisma/client").$Enums.CommentStatus;
            }[];
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: {
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
        };
    }>;
    updateCommentStatus(type: 'audio' | 'gallery' | 'video', id: number, dto: UpdateCommentStatusDto): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            audioId: number;
            text: string;
            updatedAt: Date;
            author: string;
            status: import(".prisma/client").$Enums.CommentStatus;
        } | {
            id: number;
            createdAt: Date;
            text: string;
            updatedAt: Date;
            author: string;
            status: import(".prisma/client").$Enums.CommentStatus;
            galleryId: number;
        } | {
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
