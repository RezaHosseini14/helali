import { Injectable } from '@nestjs/common';

import { ApiCacheService } from '@/shared/cache/api-cache.service';

import { DashboardRepository } from './dashboard.repository';
import type {
  AnalyticsCategoryQueryDto,
  AnalyticsQueryDto,
  AnalyticsTopQueryDto,
} from './dto/analytics-query.dto';

const OVERVIEW_CACHE_TTL_SECONDS = 30;
const ANALYTICS_CACHE_TTL_SECONDS = 60;
const CACHE_NAMESPACE = 'dashboard';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly apiCacheService: ApiCacheService,
  ) {}

  async getOverview() {
    const version = await this.apiCacheService.getVersion(CACHE_NAMESPACE);

    return this.apiCacheService.getOrSet(
      `helali:dashboard:overview:v${version}`,
      OVERVIEW_CACHE_TTL_SECONDS,
      () => this.dashboardRepository.getOverviewCounts(),
    );
  }

  async getTimeseries(query: AnalyticsQueryDto) {
    const version = await this.apiCacheService.getVersion(CACHE_NAMESPACE);
    const entityType = query.entityType ?? 'all';
    const cacheKey = `helali:dashboard:timeseries:v${version}:${entityType}:${query.from ?? ''}:${query.to ?? ''}`;

    return this.apiCacheService.getOrSet(cacheKey, ANALYTICS_CACHE_TTL_SECONDS, () =>
      this.dashboardRepository.getTimeseries(entityType, query.from, query.to),
    );
  }

  async getTop(query: AnalyticsTopQueryDto) {
    const version = await this.apiCacheService.getVersion(CACHE_NAMESPACE);
    const entityType = query.entityType ?? 'all';
    const metric = query.metric ?? 'views';
    const limit = query.limit ?? 10;
    const cacheKey = `helali:dashboard:top:v${version}:${entityType}:${metric}:${limit}:${query.from ?? ''}:${query.to ?? ''}`;

    return this.apiCacheService.getOrSet(cacheKey, ANALYTICS_CACHE_TTL_SECONDS, () =>
      this.dashboardRepository.getTopContent(
        entityType,
        metric,
        limit,
        query.from,
        query.to,
      ),
    );
  }

  async getByCategory(query: AnalyticsCategoryQueryDto) {
    const version = await this.apiCacheService.getVersion(CACHE_NAMESPACE);
    const cacheKey = `helali:dashboard:by-category:v${version}:${query.entityType}:${query.from ?? ''}:${query.to ?? ''}`;

    return this.apiCacheService.getOrSet(cacheKey, ANALYTICS_CACHE_TTL_SECONDS, () =>
      this.dashboardRepository.getByCategory(query.entityType, query.from, query.to),
    );
  }

  async getTweetAnalytics(query: AnalyticsQueryDto) {
    const version = await this.apiCacheService.getVersion(CACHE_NAMESPACE);
    const cacheKey = `helali:dashboard:tweets:v${version}:${query.from ?? ''}:${query.to ?? ''}`;

    return this.apiCacheService.getOrSet(cacheKey, ANALYTICS_CACHE_TTL_SECONDS, () =>
      this.dashboardRepository.getTweetAnalytics(query.from, query.to),
    );
  }
}
