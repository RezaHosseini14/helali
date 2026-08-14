import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Audio } from '@prisma/client';

import { PrismaService } from '@/shared/prisma/prisma.service';

const audioCategorySelect = {
  categories: {
    select: {
      categoryId: true,
    },
  },
} as const;

const audioListSelect = {
  id: true,
  title: true,
  originalName: true,
  mimetype: true,
  size: true,
  posterOriginalName: true,
  posterMimetype: true,
  posterSize: true,
  like: true,
  view: true,
  createdAt: true,
  updatedAt: true,
  ...audioCategorySelect,
} as const;

const audioRelatedVideoSelect = {
  relatedVideo: {
    select: {
      id: true,
      title: true,
      posterOriginalName: true,
    },
  },
} as const;

const audioDetailSelect = {
  ...audioListSelect,
  text: true,
  relatedVideoId: true,
  ...audioRelatedVideoSelect,
} as const;
export type IAudioListItem = Prisma.AudioGetPayload<{
  select: typeof audioListSelect;
}>;

export type IAudioWithCategories = Prisma.AudioGetPayload<{
  select: typeof audioDetailSelect;
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
  readonly relatedVideoId?: number | null;
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
  readonly relatedVideoId?: number | null;
}

@Injectable()
export class AudioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.audio.findMany({
        select: audioListSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.audio.count(),
    ]);

    return { items, total };
  }

  async findById(id: number): Promise<IAudioWithCategories | null> {
    return this.prisma.audio.findUnique({
      where: { id },
      select: audioDetailSelect,
    });
  }

  async findViewStats(id: number): Promise<{ view: number } | null> {
    return this.prisma.audio.findUnique({
      where: { id },
      select: { view: true },
    });
  }

  async create(data: ICreateAudioData): Promise<Audio> {
    return this.prisma.$transaction(async (tx) => {
      if (data.relatedVideoId !== undefined && data.relatedVideoId !== null) {
        await tx.audio.updateMany({
          where: { relatedVideoId: data.relatedVideoId },
          data: { relatedVideoId: null },
        });
      }

      return tx.audio.create({
        data: {
          title: data.title,
          text: data.text,
          originalName: data.originalName,
          mimetype: data.mimetype,
          size: data.size,
          posterOriginalName: data.posterOriginalName,
          posterMimetype: data.posterMimetype,
          posterSize: data.posterSize,
          ...(data.relatedVideoId !== undefined ? { relatedVideoId: data.relatedVideoId } : {}),
          categories: {
            create: data.categoryIds.map((categoryId) => ({
              categoryId,
            })),
          },
        },
      });
    });
  }

  async update(id: number, data: IUpdateAudioData): Promise<IAudioWithCategories> {
    if (data.categoryIds) {
      await this.prisma.audioOnCategory.deleteMany({ where: { audioId: id } });
    }

    if (data.relatedVideoId !== undefined && data.relatedVideoId !== null) {
      await this.prisma.audio.updateMany({
        where: {
          relatedVideoId: data.relatedVideoId,
          NOT: { id },
        },
        data: { relatedVideoId: null },
      });
    }

    return this.prisma.audio.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.text !== undefined ? { text: data.text } : {}),
        ...(data.originalName !== undefined ? { originalName: data.originalName } : {}),
        ...(data.mimetype !== undefined ? { mimetype: data.mimetype } : {}),
        ...(data.size !== undefined ? { size: data.size } : {}),
        ...(data.posterOriginalName !== undefined
          ? { posterOriginalName: data.posterOriginalName }
          : {}),
        ...(data.posterMimetype !== undefined ? { posterMimetype: data.posterMimetype } : {}),
        ...(data.posterSize !== undefined ? { posterSize: data.posterSize } : {}),
        ...(data.relatedVideoId !== undefined ? { relatedVideoId: data.relatedVideoId } : {}),
        ...(data.categoryIds
          ? {
              categories: {
                create: data.categoryIds.map((categoryId) => ({ categoryId })),
              },
            }
          : {}),
      },
      select: audioDetailSelect,
    });
  }

  async videoExists(id: number): Promise<boolean> {
    const count = await this.prisma.video.count({ where: { id } });
    return count > 0;
  }

  async audioExists(id: number): Promise<boolean> {
    const count = await this.prisma.audio.count({ where: { id } });
    return count > 0;
  }

  async linkVideoToAudio(videoId: number, audioId: number | null): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.audio.updateMany({
        where: { relatedVideoId: videoId },
        data: { relatedVideoId: null },
      });

      if (audioId !== null) {
        await tx.audio.update({
          where: { id: audioId },
          data: { relatedVideoId: videoId },
        });
      }
    });
  }

  async findRelatedAudioForVideo(videoId: number) {
    return this.prisma.audio.findFirst({
      where: { relatedVideoId: videoId },
      select: {
        id: true,
        title: true,
        posterOriginalName: true,
      },
    });
  }

  async delete(id: number): Promise<Audio> {
    return this.prisma.audio.delete({ where: { id } });
  }

  async incrementLike(id: number): Promise<Audio | null> {
    try {
      return await this.prisma.audio.update({
        where: { id },
        data: { like: { increment: 1 } },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }

      throw error;
    }
  }

  async incrementView(id: number): Promise<Audio | null> {
    try {
      return await this.prisma.audio.update({
        where: { id },
        data: { view: { increment: 1 } },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }

      throw error;
    }
  }
}
