import { createHash } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';
import type { Request } from 'express';

import { RedisService } from '@/shared/redis/redis.service';

export type MediaEngagementKind = 'audio' | 'video' | 'gallery';

/** One unique view/like per visitor fingerprint per media item (24h). */
const MEDIA_ENGAGEMENT_TTL_SECONDS = 60 * 60 * 24;

@Injectable()
export class MediaViewService {
  private readonly logger = new Logger(MediaViewService.name);

  constructor(private readonly redisService: RedisService) {}

  buildVisitorKey(request: Request): string {
    const ip = this.resolveClientIp(request);
    const userAgent = request.headers['user-agent'] ?? 'unknown';

    return createHash('sha256').update(`${ip}|${userAgent}`).digest('hex');
  }

  /**
   * Claims a unique view slot for this visitor.
   * Returns true when the view should be counted.
   * If Redis is unavailable, fails open (counts once) — client localStorage still soft-dedupes.
   */
  async tryClaimView(
    kind: Exclude<MediaEngagementKind, 'gallery'>,
    id: number,
    visitorKey: string,
  ): Promise<boolean> {
    return this.tryClaim('view', kind, id, visitorKey);
  }

  /**
   * Claims a unique like slot for this visitor.
   * Returns true when the like should be counted.
   */
  async tryClaimLike(
    kind: MediaEngagementKind,
    id: number,
    visitorKey: string,
  ): Promise<boolean> {
    return this.tryClaim('like', kind, id, visitorKey);
  }

  private async tryClaim(
    metric: 'view' | 'like',
    kind: MediaEngagementKind,
    id: number,
    visitorKey: string,
  ): Promise<boolean> {
    if (!this.redisService.isAvailable()) {
      const isReady = await this.redisService.ensureReady();

      if (!isReady) {
        this.logger.warn(
          `Redis unavailable — counting ${metric} without server dedupe`,
        );
        return true;
      }
    }

    const key = `media:${metric}:${kind}:${id}:${visitorKey}`;

    try {
      const result = await this.redisService
        .getClient()
        .set(key, '1', 'EX', MEDIA_ENGAGEMENT_TTL_SECONDS, 'NX');

      return result === 'OK';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`${metric} claim failed (${kind}/${id}): ${message}`);
      return true;
    }
  }

  private resolveClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];

    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0]?.trim() || request.ip || 'unknown';
    }

    if (Array.isArray(forwarded) && forwarded[0]) {
      return forwarded[0].trim();
    }

    return request.ip ?? 'unknown';
  }
}
