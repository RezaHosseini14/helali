import { apiClient, unwrapApiResponse } from '@/services/api-client';

export interface IDashboardOverview {
  readonly users: number;
  readonly audios: number;
  readonly videos: number;
  readonly galleries: number;
  readonly comments: number;
  readonly totalAudioViews: number;
  readonly totalVideoViews: number;
  readonly totalGalleryViews: number;
  readonly totalLikes: number;
}

export interface IAnalyticsTimeseriesPoint {
  readonly date: string;
  readonly views: number;
  readonly likes: number;
}

export interface IAnalyticsTopItem {
  readonly entityType: 'audio' | 'video' | 'gallery';
  readonly entityId: number;
  readonly title: string;
  readonly views: number;
  readonly likes: number;
}

export interface IAnalyticsCategoryItem {
  readonly categoryId: number;
  readonly categoryTitle: string;
  readonly views: number;
  readonly likes: number;
}

export interface ITweetAnalyticsSummary {
  readonly totalTweets: number;
  readonly publishedCount: number;
  readonly unpublishedCount: number;
  readonly withVideoCount: number;
  readonly withImageCount: number;
  readonly textOnlyCount: number;
  readonly totalLikes: number;
  readonly totalReplies: number;
  readonly totalRetweets: number;
  readonly totalQuotes: number;
  readonly totalEngagement: number;
  readonly avgLikes: number;
  readonly avgReplies: number;
  readonly avgRetweets: number;
  readonly avgQuotes: number;
}

export interface ITweetAnalyticsNamedValue {
  readonly key: string;
  readonly label: string;
  readonly value: number;
}

export interface ITweetAnalyticsTimeseriesPoint {
  readonly date: string;
  readonly tweets: number;
  readonly likes: number;
  readonly replies: number;
  readonly retweets: number;
  readonly quotes: number;
}

export interface ITweetAnalyticsTopItem {
  readonly id: number;
  readonly text: string;
  readonly likeCount: number;
  readonly replyCount: number;
  readonly retweetCount: number;
  readonly quoteCount: number;
  readonly engagement: number;
  readonly hasVideo: boolean;
  readonly hasImage: boolean;
  readonly isPublished: boolean;
  readonly publishedAt: string;
}

export interface ITweetAnalytics {
  readonly summary: ITweetAnalyticsSummary;
  readonly engagementBreakdown: ReadonlyArray<ITweetAnalyticsNamedValue>;
  readonly mediaMix: ReadonlyArray<ITweetAnalyticsNamedValue>;
  readonly timeseries: ReadonlyArray<ITweetAnalyticsTimeseriesPoint>;
  readonly topTweets: ReadonlyArray<ITweetAnalyticsTopItem>;
}

export async function getDashboardOverview(): Promise<IDashboardOverview> {
  return unwrapApiResponse(apiClient.get('/dashboard/overview'));
}

export async function getAnalyticsTimeseries(params?: {
  entityType?: string;
  from?: string;
  to?: string;
}): Promise<{ points: IAnalyticsTimeseriesPoint[] }> {
  return unwrapApiResponse(
    apiClient.get('/dashboard/analytics/timeseries', { params }),
  );
}

export async function getAnalyticsTop(params?: {
  entityType?: string;
  metric?: 'views' | 'likes';
  limit?: number;
  from?: string;
  to?: string;
}): Promise<{ items: IAnalyticsTopItem[] }> {
  return unwrapApiResponse(apiClient.get('/dashboard/analytics/top', { params }));
}

export async function getAnalyticsByCategory(params: {
  entityType: 'audio' | 'video';
  from?: string;
  to?: string;
}): Promise<{ categories: IAnalyticsCategoryItem[] }> {
  return unwrapApiResponse(
    apiClient.get('/dashboard/analytics/by-category', { params }),
  );
}

export async function getTweetAnalytics(params?: {
  from?: string;
  to?: string;
}): Promise<ITweetAnalytics> {
  return unwrapApiResponse(apiClient.get('/dashboard/analytics/tweets', { params }));
}
