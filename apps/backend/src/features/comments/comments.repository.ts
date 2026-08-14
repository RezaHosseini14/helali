import { Injectable } from '@nestjs/common';
import type { CommentStatus } from '@prisma/client';

import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAudioById(id: number) {
    return this.prisma.audio.findUnique({ where: { id } });
  }

  async findGalleryById(id: number) {
    return this.prisma.gallery.findUnique({ where: { id } });
  }

  async findVideoById(id: number) {
    return this.prisma.video.findUnique({ where: { id } });
  }

  async createAudioComment(audioId: number, author: string, text: string) {
    return this.prisma.audioComment.create({
      data: { audioId, author, text },
    });
  }

  async createGalleryComment(galleryId: number, author: string, text: string) {
    return this.prisma.galleryComment.create({
      data: { galleryId, author, text },
    });
  }

  async createVideoComment(videoId: number, author: string, text: string) {
    return this.prisma.videoComment.create({
      data: { videoId, author, text },
    });
  }

  async findPublishedAudioComments(audioId: number) {
    return this.prisma.audioComment.findMany({
      where: {
        audioId,
        status: 'published',
      },
      select: {
        id: true,
        author: true,
        text: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        audioId: true,
      },
      orderBy: { id: 'desc' },
      take: 100,
    });
  }

  async findPublishedGalleryComments(galleryId: number) {
    return this.prisma.galleryComment.findMany({
      where: {
        galleryId,
        status: 'published',
      },
      select: {
        id: true,
        author: true,
        text: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        galleryId: true,
      },
      orderBy: { id: 'desc' },
      take: 100,
    });
  }

  async findPublishedVideoComments(videoId: number) {
    return this.prisma.videoComment.findMany({
      where: {
        videoId,
        status: 'published',
      },
      select: {
        id: true,
        author: true,
        text: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        videoId: true,
      },
      orderBy: { id: 'desc' },
      take: 100,
    });
  }

  async findAllComments() {
    const [audioComments, galleryComments, videoComments] = await Promise.all([
      this.prisma.audioComment.findMany({
        orderBy: { createdAt: 'desc' },
        include: { audio: { select: { id: true, title: true } } },
      }),
      this.prisma.galleryComment.findMany({
        orderBy: { createdAt: 'desc' },
        include: { gallery: { select: { id: true, originalName: true } } },
      }),
      this.prisma.videoComment.findMany({
        orderBy: { createdAt: 'desc' },
        include: { video: { select: { id: true, title: true } } },
      }),
    ]);

    return { audioComments, galleryComments, videoComments };
  }

  async findAudioCommentById(id: number) {
    return this.prisma.audioComment.findUnique({ where: { id } });
  }

  async findGalleryCommentById(id: number) {
    return this.prisma.galleryComment.findUnique({ where: { id } });
  }

  async findVideoCommentById(id: number) {
    return this.prisma.videoComment.findUnique({ where: { id } });
  }

  async updateAudioCommentStatus(id: number, status: CommentStatus) {
    return this.prisma.audioComment.update({
      where: { id },
      data: { status },
    });
  }

  async updateGalleryCommentStatus(id: number, status: CommentStatus) {
    return this.prisma.galleryComment.update({
      where: { id },
      data: { status },
    });
  }

  async updateVideoCommentStatus(id: number, status: CommentStatus) {
    return this.prisma.videoComment.update({
      where: { id },
      data: { status },
    });
  }
}
