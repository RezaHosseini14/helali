import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PublicMessage } from '@/shared/constants/messages';

import { CommentsRepository } from './comments.repository';
import type { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async createAudioComment(dto: CreateCommentDto, audioId: number) {
    const audio = await this.commentsRepository.findAudioById(audioId);

    if (!audio) {
      throw new NotFoundException('فایل موردنظر یافت نشد');
    }

    await this.commentsRepository.createAudioComment(audioId, dto.author, dto.text);

    return { message: PublicMessage.CreatedComment };
  }

  async createGalleryComment(dto: CreateCommentDto, galleryId: number) {
    const gallery = await this.commentsRepository.findGalleryById(galleryId);

    if (!gallery) {
      throw new NotFoundException('تصویر موردنظر یافت نشد');
    }

    await this.commentsRepository.createGalleryComment(galleryId, dto.author, dto.text);

    return { message: PublicMessage.CreatedComment };
  }

  async createVideoComment(dto: CreateCommentDto, videoId: number) {
    const video = await this.commentsRepository.findVideoById(videoId);

    if (!video) {
      throw new NotFoundException('ویدیو موردنظر یافت نشد');
    }

    await this.commentsRepository.createVideoComment(videoId, dto.author, dto.text);

    return { message: PublicMessage.CreatedComment };
  }

  async findPublishedAudioComments(audioId: number) {
    try {
      const comments = await this.commentsRepository.findPublishedAudioComments(audioId);

      return {
        message: 'لیست نظرات دریافت شد',
        comments,
      };
    } catch {
      throw new InternalServerErrorException('خطایی رخ داد');
    }
  }

  async findPublishedGalleryComments(galleryId: number) {
    try {
      const comments = await this.commentsRepository.findPublishedGalleryComments(galleryId);

      return {
        message: 'لیست نظرات دریافت شد',
        comments,
      };
    } catch {
      throw new InternalServerErrorException('خطایی رخ داد');
    }
  }

  async findPublishedVideoComments(videoId: number) {
    try {
      const comments = await this.commentsRepository.findPublishedVideoComments(videoId);

      return {
        message: 'لیست نظرات دریافت شد',
        comments,
      };
    } catch {
      throw new InternalServerErrorException('خطایی رخ داد');
    }
  }

  async findAll() {
    try {
      const { audioComments, galleryComments, videoComments } =
        await this.commentsRepository.findAllComments();

      const comments = [
        ...audioComments.map((comment) => ({
          id: comment.id,
          author: comment.author,
          text: comment.text,
          status: comment.status,
          type: 'audio' as const,
          targetId: comment.audioId,
          targetTitle: comment.audio.title,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        })),
        ...galleryComments.map((comment) => ({
          id: comment.id,
          author: comment.author,
          text: comment.text,
          status: comment.status,
          type: 'gallery' as const,
          targetId: comment.galleryId,
          targetTitle: comment.gallery.originalName,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        })),
        ...videoComments.map((comment) => ({
          id: comment.id,
          author: comment.author,
          text: comment.text,
          status: comment.status,
          type: 'video' as const,
          targetId: comment.videoId,
          targetTitle: comment.video.title,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        })),
      ].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );

      return {
        message: 'لیست نظرات دریافت شد',
        comments,
        total: comments.length,
      };
    } catch {
      throw new InternalServerErrorException('خطایی رخ داد');
    }
  }

  async updateCommentStatus(
    commentId: number,
    commentType: 'audio' | 'gallery' | 'video',
    newStatus: string,
  ) {
    const status = newStatus as 'pending' | 'published' | 'rejected';

    if (commentType === 'audio') {
      const comment = await this.commentsRepository.findAudioCommentById(commentId);

      if (!comment) {
        throw new NotFoundException('کامنت صوتی یافت نشد');
      }

      const updated = await this.commentsRepository.updateAudioCommentStatus(commentId, status);

      return {
        message: `وضعیت کامنت به ${newStatus} تغییر یافت`,
        comment: updated,
      };
    }

    if (commentType === 'gallery') {
      const comment = await this.commentsRepository.findGalleryCommentById(commentId);

      if (!comment) {
        throw new NotFoundException('کامنت گالری یافت نشد');
      }

      const updated = await this.commentsRepository.updateGalleryCommentStatus(
        commentId,
        status,
      );

      return {
        message: `وضعیت کامنت به ${newStatus} تغییر یافت`,
        comment: updated,
      };
    }

    if (commentType === 'video') {
      const comment = await this.commentsRepository.findVideoCommentById(commentId);

      if (!comment) {
        throw new NotFoundException('کامنت ویدیو یافت نشد');
      }

      const updated = await this.commentsRepository.updateVideoCommentStatus(commentId, status);

      return {
        message: `وضعیت کامنت به ${newStatus} تغییر یافت`,
        comment: updated,
      };
    }

    throw new BadRequestException('نوع کامنت معتبر نیست');
  }
}
