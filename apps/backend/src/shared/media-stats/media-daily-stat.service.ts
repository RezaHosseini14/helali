import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@/shared/prisma/prisma.service';

export type MediaStatEntityType = 'audio' | 'video' | 'gallery';
export type MediaStatMetric = 'views' | 'likes';

const TEHRAN_TIME_ZONE = 'Asia/Tehran';

@Injectable()
export class MediaDailyStatService {
  private readonly logger = new Logger(MediaDailyStatService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Calendar date in Asia/Tehran as UTC midnight Date for @db.Date. */
  getTehranDate(now = new Date()): Date {
    const dateString = new Intl.DateTimeFormat('en-CA', {
      timeZone: TEHRAN_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    return new Date(`${dateString}T00:00:00.000Z`);
  }

  async recordView(entityType: MediaStatEntityType, entityId: number): Promise<void> {
    await this.increment(entityType, entityId, 'views');
  }

  async recordLike(entityType: MediaStatEntityType, entityId: number): Promise<void> {
    await this.increment(entityType, entityId, 'likes');
  }

  private async increment(
    entityType: MediaStatEntityType,
    entityId: number,
    metric: MediaStatMetric,
  ): Promise<void> {
    const date = this.getTehranDate();

    try {
      await this.prisma.mediaDailyStat.upsert({
        where: {
          entityType_entityId_date: {
            entityType,
            entityId,
            date,
          },
        },
        create: {
          entityType,
          entityId,
          date,
          views: metric === 'views' ? 1 : 0,
          likes: metric === 'likes' ? 1 : 0,
        },
        update:
          metric === 'views'
            ? { views: { increment: 1 } }
            : { likes: { increment: 1 } },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(
        `Failed to record ${metric} for ${entityType}/${entityId}: ${message}`,
      );
    }
  }
}
