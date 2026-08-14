import { Injectable } from '@nestjs/common';

import { ApiCacheService } from '@/shared/cache/api-cache.service';

import { DashboardRepository } from './dashboard.repository';

const OVERVIEW_CACHE_TTL_SECONDS = 30;
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
}
