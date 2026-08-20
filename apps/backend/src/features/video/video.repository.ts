import { Injectable } from '@nestjs/common';
import { Prisma, VideoProcessingStatus } from '@prisma/client';
import type { Video } from '@prisma/client';

import { rankSuggestionCandidates } from '@/shared/media-suggestions/score-suggestions';
import { PrismaService } from '@/shared/prisma/prisma.service';

const STORIES_LIMIT = 24;
const REELS_CATEGORY_TITLE = 'reels';

const reelsCategoryWhere = {
  categories: {
    some: {
      category: {
        title: REELS_CATEGORY_TITLE,
      },
    },
  },
} as const;

const nonReelsCategoryWhere = {
  categories: {
    none: {
      category: {
        title: REELS_CATEGORY_TITLE,
      },
    },
  },
} as const;

const videoCategorySelect = {
  categories: {
    select: {
      categoryId: true,
    },
  },
} as const;

const videoListSelect = {
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
  processingStatus: true,
  hlsMasterKey: true,
  hlsPrefix: true,
  durationSec: true,
  processingError: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true,
  ...videoCategorySelect,
} as const;

const videoDetailSelect = {
  ...videoListSelect,
  text: true,
} as const;

const videoStorySelect = {
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
  processingStatus: true,
  hlsMasterKey: true,
  hlsPrefix: true,
  durationSec: true,
  processingError: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type IVideoListItem = Prisma.VideoGetPayload<{
  select: typeof videoListSelect;
}>;

export type IVideoWithCategories = Prisma.VideoGetPayload<{
  select: typeof videoDetailSelect;
}>;

export type IVideoStoryItem = Prisma.VideoGetPayload<{
  select: typeof videoStorySelect;
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
  readonly categoryIds?: ReadonlyArray<number>;
}

@Injectable()
export class VideoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where: nonReelsCategoryWhere,
        select: videoListSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.video.count({ where: nonReelsCategoryWhere }),
    ]);

    return { items, total };
  }

  async findById(id: number): Promise<IVideoWithCategories | null> {
    return this.prisma.video.findUnique({
      where: { id },
      select: videoDetailSelect,
    });
  }

  async findSuggestions(id: number, limit: number): Promise<IVideoListItem[]> {
    const source = await this.prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        categories: { select: { categoryId: true } },
      },
    });

    if (!source) {
      return [];
    }

    const categoryIds = source.categories.map((item) => item.categoryId);
    const candidateLimit = Math.max(limit * 8, 40);

    let candidates: IVideoListItem[] = [];

    if (categoryIds.length > 0) {
      candidates = await this.prisma.video.findMany({
        where: {
          id: { not: id },
          ...nonReelsCategoryWhere,
          categories: {
            some: {
              categoryId: { in: categoryIds },
            },
          },
        },
        select: videoListSelect,
        take: candidateLimit,
      });
    }

    if (candidates.length < limit) {
      const existingIds = new Set([id, ...candidates.map((item) => item.id)]);
      const fallback = await this.prisma.video.findMany({
        where: {
          id: { notIn: [...existingIds] },
          ...nonReelsCategoryWhere,
        },
        select: videoListSelect,
        orderBy: [{ view: 'desc' }, { createdAt: 'desc' }],
        take: limit * 4,
      });
      candidates = [...candidates, ...fallback];
    }

    return rankSuggestionCandidates(candidates, categoryIds, limit);
  }

  async findViewStats(id: number): Promise<{ view: number; like: number } | null> {
    return this.prisma.video.findUnique({
      where: { id },
      select: { view: true, like: true },
    });
  }

  async findStories(): Promise<IVideoStoryItem[]> {
    return this.prisma.video.findMany({
      where: reelsCategoryWhere,
      select: videoStorySelect,
      orderBy: { createdAt: 'desc' },
      take: STORIES_LIMIT,
    });
  }

  async create(data: ICreateVideoData): Promise<Video> {
    return this.prisma.video.create({
      data: {
        title: data.title,
        text: data.text,
        originalName: data.originalName,
        mimetype: data.mimetype,
        size: data.size,
        posterOriginalName: data.posterOriginalName,
        posterMimetype: data.posterMimetype,
        posterSize: data.posterSize,
        processingStatus: VideoProcessingStatus.pending,
        categories: {
          create: data.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
      },
    });
  }

  async findIdsMissingHls(limit: number): Promise<ReadonlyArray<number>> {
    const rows = await this.prisma.video.findMany({
      where: {
        hlsMasterKey: null,
        processingStatus: {
          in: [VideoProcessingStatus.ready, VideoProcessingStatus.failed],
        },
      },
      select: { id: true },
      orderBy: { id: 'asc' },
      take: limit,
    });

    return rows.map((row) => row.id);
  }

  async updateProcessing(
    id: number,
    data: {
      readonly processingStatus?: VideoProcessingStatus;
      readonly hlsMasterKey?: string | null;
      readonly hlsPrefix?: string | null;
      readonly durationSec?: number | null;
      readonly processingError?: string | null;
      readonly processedAt?: Date | null;
    },
  ): Promise<Video> {
    return this.prisma.video.update({
      where: { id },
      data: {
        ...(data.processingStatus !== undefined
          ? { processingStatus: data.processingStatus }
          : {}),
        ...(data.hlsMasterKey !== undefined ? { hlsMasterKey: data.hlsMasterKey } : {}),
        ...(data.hlsPrefix !== undefined ? { hlsPrefix: data.hlsPrefix } : {}),
        ...(data.durationSec !== undefined ? { durationSec: data.durationSec } : {}),
        ...(data.processingError !== undefined
          ? { processingError: data.processingError }
          : {}),
        ...(data.processedAt !== undefined ? { processedAt: data.processedAt } : {}),
      },
    });
  }

  async update(id: number, data: IUpdateVideoData): Promise<IVideoWithCategories> {
    if (data.categoryIds) {
      await this.prisma.videoOnCategory.deleteMany({ where: { videoId: id } });
    }

    return this.prisma.video.update({
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
        ...(data.categoryIds
          ? {
              categories: {
                create: data.categoryIds.map((categoryId) => ({ categoryId })),
              },
            }
          : {}),
      },
      select: videoDetailSelect,
    });
  }

  async delete(id: number): Promise<Video> {
    return this.prisma.video.delete({ where: { id } });
  }

  async incrementLike(id: number): Promise<Video | null> {
    try {
      return await this.prisma.video.update({
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

  async incrementView(id: number): Promise<Video | null> {
    try {
      return await this.prisma.video.update({
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
