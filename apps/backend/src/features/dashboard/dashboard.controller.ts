import { Controller, Get } from '@nestjs/common';

import { CheckAbility } from '@/shared/decorators/check-ability.decorator';

import { DashboardService } from './dashboard.service';

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
}
