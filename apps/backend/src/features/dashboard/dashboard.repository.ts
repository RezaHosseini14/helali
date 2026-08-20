import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { UsersRepository } from '@/features/users/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { MediaDailyStatService } from '@/shared/media-stats/media-daily-stat.service';

export type AnalyticsEntityType = 'audio' | 'video' | 'gallery';
export type AnalyticsMetric = 'views' | 'likes';

@Injectable()
export class DashboardRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository,
    private readonly mediaDailyStatService: MediaDailyStatService,
  ) {}

  async getOverviewCounts() {
    const [
      users,
      audios,
      videos,
      galleries,
      audioComments,
      galleryComments,
      videoComments,
      audioViews,
      videoViews,
      galleryViews,
      audioLikes,
      videoLikes,
      galleryLikes,
    ] = await Promise.all([
      this.usersRepository.countAll(),
      this.usersRepository.countAudios(),
      this.usersRepository.countVideos(),
      this.usersRepository.countGalleries(),
      this.prisma.audioComment.count(),
      this.prisma.galleryComment.count(),
      this.prisma.videoComment.count(),
      this.prisma.audio.aggregate({ _sum: { view: true } }),
      this.prisma.video.aggregate({ _sum: { view: true } }),
      this.prisma.gallery.aggregate({ _sum: { view: true } }),
      this.prisma.audio.aggregate({ _sum: { like: true } }),
      this.prisma.video.aggregate({ _sum: { like: true } }),
      this.prisma.gallery.aggregate({ _sum: { like: true } }),
    ]);

    const totalAudioViews = audioViews._sum.view ?? 0;
    const totalVideoViews = videoViews._sum.view ?? 0;
    const totalGalleryViews = galleryViews._sum.view ?? 0;

    return {
      users,
      audios,
      videos,
      galleries,
      comments: audioComments + galleryComments + videoComments,
      totalAudioViews,
      totalVideoViews,
      totalGalleryViews,
      totalLikes:
        (audioLikes._sum.like ?? 0) +
        (videoLikes._sum.like ?? 0) +
        (galleryLikes._sum.like ?? 0),
    };
  }

  resolveDateRange(from?: string, to?: string): { from: Date; to: Date } {
    const today = this.mediaDailyStatService.getTehranDate();
    const defaultFrom = new Date(today);
    defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 6);

    const fromDate = from ? new Date(`${from.slice(0, 10)}T00:00:00.000Z`) : defaultFrom;
    const toDate = to ? new Date(`${to.slice(0, 10)}T00:00:00.000Z`) : today;

    return { from: fromDate, to: toDate };
  }

  async getTimeseries(
    entityType: AnalyticsEntityType | 'all',
    from?: string,
    to?: string,
  ) {
    const range = this.resolveDateRange(from, to);
    const where: Prisma.MediaDailyStatWhereInput = {
      date: { gte: range.from, lte: range.to },
      ...(entityType === 'all' ? {} : { entityType }),
    };

    const rows = await this.prisma.mediaDailyStat.groupBy({
      by: ['date'],
      where,
      _sum: { views: true, likes: true },
      orderBy: { date: 'asc' },
    });

    return rows.map((row) => ({
      date: row.date.toISOString().slice(0, 10),
      views: row._sum.views ?? 0,
      likes: row._sum.likes ?? 0,
    }));
  }

  async getTopContent(
    entityType: AnalyticsEntityType | 'all',
    metric: AnalyticsMetric,
    limit: number,
    from?: string,
    to?: string,
  ) {
    const range = this.resolveDateRange(from, to);
    const where: Prisma.MediaDailyStatWhereInput = {
      date: { gte: range.from, lte: range.to },
      ...(entityType === 'all' ? {} : { entityType }),
    };

    const grouped = await this.prisma.mediaDailyStat.groupBy({
      by: ['entityType', 'entityId'],
      where,
      _sum: { views: true, likes: true },
    });

    const sorted = grouped
      .map((row) => ({
        entityType: row.entityType as AnalyticsEntityType,
        entityId: row.entityId,
        views: row._sum.views ?? 0,
        likes: row._sum.likes ?? 0,
        value: metric === 'views' ? (row._sum.views ?? 0) : (row._sum.likes ?? 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);

    const enriched = await Promise.all(
      sorted.map(async (item) => {
        const title = await this.resolveEntityTitle(item.entityType, item.entityId);
        return {
          entityType: item.entityType,
          entityId: item.entityId,
          title,
          views: item.views,
          likes: item.likes,
        };
      }),
    );

    return enriched;
  }

  async getByCategory(
    entityType: 'audio' | 'video',
    from?: string,
    to?: string,
  ) {
    const range = this.resolveDateRange(from, to);

    if (entityType === 'audio') {
      const rows = await this.prisma.$queryRaw<
        Array<{ categoryId: number; categoryTitle: string; views: bigint; likes: bigint }>
      >`
        SELECT
          c.id AS "categoryId",
          c.title AS "categoryTitle",
          COALESCE(SUM(mds.views), 0) AS views,
          COALESCE(SUM(mds.likes), 0) AS likes
        FROM category c
        INNER JOIN audio_categories ac ON ac.category_id = c.id
        LEFT JOIN media_daily_stats mds
          ON mds.entity_type = 'audio'
          AND mds.entity_id = ac.audio_id
          AND mds.date >= ${range.from}
          AND mds.date <= ${range.to}
        GROUP BY c.id, c.title
        ORDER BY views DESC, likes DESC, c.sort ASC
      `;

      return rows.map((row) => ({
        categoryId: row.categoryId,
        categoryTitle: row.categoryTitle,
        views: Number(row.views),
        likes: Number(row.likes),
      }));
    }

    const rows = await this.prisma.$queryRaw<
      Array<{ categoryId: number; categoryTitle: string; views: bigint; likes: bigint }>
    >`
      SELECT
        c.id AS "categoryId",
        c.title AS "categoryTitle",
        COALESCE(SUM(mds.views), 0) AS views,
        COALESCE(SUM(mds.likes), 0) AS likes
      FROM category c
      INNER JOIN video_categories vc ON vc.category_id = c.id
      LEFT JOIN media_daily_stats mds
        ON mds.entity_type = 'video'
        AND mds.entity_id = vc.video_id
        AND mds.date >= ${range.from}
        AND mds.date <= ${range.to}
      WHERE c.title <> 'reels'
      GROUP BY c.id, c.title
      ORDER BY views DESC, likes DESC, c.sort ASC
    `;

    return rows.map((row) => ({
      categoryId: row.categoryId,
      categoryTitle: row.categoryTitle,
      views: Number(row.views),
      likes: Number(row.likes),
    }));
  }

  async getTweetAnalytics(from?: string, to?: string) {
    const today = this.mediaDailyStatService.getTehranDate();
    const defaultFrom = new Date(today);
    defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);

    const fromDate = from ? new Date(`${from.slice(0, 10)}T00:00:00.000Z`) : defaultFrom;
    const toDate = to ? new Date(`${to.slice(0, 10)}T00:00:00.000Z`) : today;
    const range = { from: fromDate, to: toDate };
    const rangeEndExclusive = new Date(range.to.getTime() + 24 * 60 * 60 * 1000);

    const inRange = {
      publishedAt: {
        gte: range.from,
        lt: rangeEndExclusive,
      },
    };

    const [
      totalTweets,
      publishedCount,
      withVideoCount,
      withImageOnlyCount,
      engagementAgg,
      topRows,
      dailyRows,
    ] = await Promise.all([
      this.prisma.tweet.count({ where: inRange }),
      this.prisma.tweet.count({ where: { ...inRange, isPublished: true } }),
      this.prisma.tweet.count({ where: { ...inRange, hasVideo: true } }),
      this.prisma.tweet.count({
        where: {
          ...inRange,
          hasVideo: false,
          NOT: { imageUrls: { equals: [] } },
        },
      }),
      this.prisma.tweet.aggregate({
        where: inRange,
        _sum: {
          likeCount: true,
          replyCount: true,
          retweetCount: true,
          quoteCount: true,
        },
        _avg: {
          likeCount: true,
          replyCount: true,
          retweetCount: true,
          quoteCount: true,
        },
      }),
      this.prisma.tweet.findMany({
        where: inRange,
        orderBy: [{ likeCount: 'desc' }, { retweetCount: 'desc' }],
        take: 8,
        select: {
          id: true,
          text: true,
          likeCount: true,
          replyCount: true,
          retweetCount: true,
          quoteCount: true,
          hasVideo: true,
          imageUrls: true,
          isPublished: true,
          publishedAt: true,
        },
      }),
      this.prisma.$queryRaw<
        Array<{
          date: Date;
          tweets: bigint;
          likes: bigint;
          replies: bigint;
          retweets: bigint;
          quotes: bigint;
        }>
      >`
        SELECT
          DATE(published_at AT TIME ZONE 'UTC') AS date,
          COUNT(*)::bigint AS tweets,
          COALESCE(SUM(like_count), 0)::bigint AS likes,
          COALESCE(SUM(reply_count), 0)::bigint AS replies,
          COALESCE(SUM(retweet_count), 0)::bigint AS retweets,
          COALESCE(SUM(quote_count), 0)::bigint AS quotes
        FROM tweet
        WHERE published_at >= ${range.from}
          AND published_at < ${rangeEndExclusive}
        GROUP BY DATE(published_at AT TIME ZONE 'UTC')
        ORDER BY date ASC
      `,
    ]);

    const totalLikes = engagementAgg._sum.likeCount ?? 0;
    const totalReplies = engagementAgg._sum.replyCount ?? 0;
    const totalRetweets = engagementAgg._sum.retweetCount ?? 0;
    const totalQuotes = engagementAgg._sum.quoteCount ?? 0;
    const totalEngagement = totalLikes + totalReplies + totalRetweets + totalQuotes;
    const textOnlyCount = Math.max(totalTweets - withVideoCount - withImageOnlyCount, 0);

    const topTweets = topRows
      .map((row) => {
        const engagement =
          row.likeCount + row.replyCount + row.retweetCount + row.quoteCount;
        return {
          id: row.id,
          text: row.text.length > 80 ? `${row.text.slice(0, 80)}…` : row.text,
          likeCount: row.likeCount,
          replyCount: row.replyCount,
          retweetCount: row.retweetCount,
          quoteCount: row.quoteCount,
          engagement,
          hasVideo: row.hasVideo,
          hasImage: row.imageUrls.length > 0,
          isPublished: row.isPublished,
          publishedAt: row.publishedAt.toISOString(),
        };
      })
      .sort((a, b) => b.engagement - a.engagement);

    return {
      summary: {
        totalTweets,
        publishedCount,
        unpublishedCount: Math.max(totalTweets - publishedCount, 0),
        withVideoCount,
        withImageCount: withImageOnlyCount,
        textOnlyCount,
        totalLikes,
        totalReplies,
        totalRetweets,
        totalQuotes,
        totalEngagement,
        avgLikes: Number((engagementAgg._avg.likeCount ?? 0).toFixed(1)),
        avgReplies: Number((engagementAgg._avg.replyCount ?? 0).toFixed(1)),
        avgRetweets: Number((engagementAgg._avg.retweetCount ?? 0).toFixed(1)),
        avgQuotes: Number((engagementAgg._avg.quoteCount ?? 0).toFixed(1)),
      },
      engagementBreakdown: [
        { key: 'likes', label: 'لایک', value: totalLikes },
        { key: 'replies', label: 'پاسخ', value: totalReplies },
        { key: 'retweets', label: 'ری‌توییت', value: totalRetweets },
        { key: 'quotes', label: 'نقل‌قول', value: totalQuotes },
      ],
      mediaMix: [
        { key: 'video', label: 'ویدیو', value: withVideoCount },
        { key: 'image', label: 'تصویر', value: withImageOnlyCount },
        { key: 'text', label: 'فقط متن', value: textOnlyCount },
      ],
      timeseries: dailyRows.map((row) => ({
        date: row.date.toISOString().slice(0, 10),
        tweets: Number(row.tweets),
        likes: Number(row.likes),
        replies: Number(row.replies),
        retweets: Number(row.retweets),
        quotes: Number(row.quotes),
      })),
      topTweets,
    };
  }

  private async resolveEntityTitle(
    entityType: AnalyticsEntityType,
    entityId: number,
  ): Promise<string> {
    if (entityType === 'audio') {
      const audio = await this.prisma.audio.findUnique({
        where: { id: entityId },
        select: { title: true },
      });
      return audio?.title ?? `#${entityId}`;
    }

    if (entityType === 'video') {
      const video = await this.prisma.video.findUnique({
        where: { id: entityId },
        select: { title: true },
      });
      return video?.title ?? `#${entityId}`;
    }

    const gallery = await this.prisma.gallery.findUnique({
      where: { id: entityId },
      select: { desc: true, originalName: true },
    });
    return gallery?.desc?.trim() || gallery?.originalName || `#${entityId}`;
  }
}
