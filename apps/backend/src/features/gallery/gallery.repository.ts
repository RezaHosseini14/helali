import { Injectable } from '@nestjs/common';
import type { Gallery } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/shared/prisma/prisma.service';

export interface ICreateGalleryData {
  readonly desc?: string;
  readonly originalName: string;
  readonly mimetype: string;
  readonly size: string;
  readonly isFeatured?: boolean;
}

const galleryListSelect = {
  id: true,
  originalName: true,
  mimetype: true,
  size: true,
  desc: true,
  like: true,
  view: true,
  isFeatured: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class GalleryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.gallery.findMany({
        select: galleryListSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.gallery.count(),
    ]);

    return { items, total };
  }

  async findFeatured(limit: number) {
    return this.prisma.gallery.findMany({
      where: { isFeatured: true },
      select: galleryListSelect,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findById(id: number): Promise<Gallery | null> {
    return this.prisma.gallery.findUnique({ where: { id } });
  }

  async create(data: ICreateGalleryData): Promise<Gallery> {
    return this.prisma.gallery.create({
      data: {
        desc: data.desc,
        originalName: data.originalName,
        mimetype: data.mimetype,
        size: data.size,
        isFeatured: data.isFeatured ?? false,
      },
    });
  }

  async delete(id: number): Promise<Gallery> {
    return this.prisma.gallery.delete({ where: { id } });
  }

  async setFeatured(id: number, isFeatured: boolean): Promise<Gallery> {
    return this.prisma.gallery.update({
      where: { id },
      data: { isFeatured },
    });
  }

  async findLikeStats(id: number): Promise<{ like: number | null } | null> {
    return this.prisma.gallery.findUnique({
      where: { id },
      select: { like: true },
    });
  }

  async incrementLike(id: number): Promise<Gallery | null> {
    try {
      return await this.prisma.gallery.update({
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
}
