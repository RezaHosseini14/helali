import { Controller, Get, Query } from '@nestjs/common';

import { CheckAbility } from '@/shared/decorators/check-ability.decorator';

import { DashboardService } from './dashboard.service';
import {
  AnalyticsCategoryQueryDto,
  AnalyticsQueryDto,
  AnalyticsTopQueryDto,
} from './dto/analytics-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @CheckAbility({ action: 'read', subject: 'Dashboard' })
  async getOverview() {
    const data = await this.dashboardService.getOverview();

    return {
      message: 'آمار داشبورد دریافت شد',
      data,
    };
  }

  @Get('analytics/timeseries')
  @CheckAbility({ action: 'read', subject: 'Dashboard' })
  async getTimeseries(@Query() query: AnalyticsQueryDto) {
    const data = await this.dashboardService.getTimeseries(query);

    return {
      message: 'روند آمار محتوا دریافت شد',
      data: { points: data },
    };
  }

  @Get('analytics/top')
  @CheckAbility({ action: 'read', subject: 'Dashboard' })
  async getTop(@Query() query: AnalyticsTopQueryDto) {
    const data = await this.dashboardService.getTop(query);

    return {
      message: 'برترین آثار دریافت شد',
      data: { items: data },
    };
  }

  @Get('analytics/by-category')
  @CheckAbility({ action: 'read', subject: 'Dashboard' })
  async getByCategory(@Query() query: AnalyticsCategoryQueryDto) {
    const data = await this.dashboardService.getByCategory(query);

    return {
      message: 'آمار دسته‌ها دریافت شد',
      data: { categories: data },
    };
  }

  @Get('analytics/tweets')
  @CheckAbility({ action: 'read', subject: 'Dashboard' })
  async getTweetAnalytics(@Query() query: AnalyticsQueryDto) {
    const data = await this.dashboardService.getTweetAnalytics(query);

    return {
      message: 'آمار توییت‌ها دریافت شد',
      data,
    };
  }
}
