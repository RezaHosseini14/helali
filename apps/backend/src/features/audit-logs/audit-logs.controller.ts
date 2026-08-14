import { Controller, Get, Param, Query } from '@nestjs/common';

import { CheckAbility } from '@/shared/decorators/check-ability.decorator';

import { ListAuditLogsDto } from './dto/list-audit-logs.dto';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @CheckAbility({ action: 'read', subject: 'AuditLog' })
  async findAll(@Query() query: ListAuditLogsDto) {
    const data = await this.auditLogsService.findAll({
      page: query.page,
      limit: query.limit,
      action: query.action,
      entityType: query.entityType,
      userId: query.userId,
      search: query.search,
      from: query.from,
      to: query.to,
    });

    return {
      message: 'لاگ‌های ممیزی دریافت شد',
      data,
    };
  }

  @Get(':id')
  @CheckAbility({ action: 'read', subject: 'AuditLog' })
  async findById(@Param('id') id: string) {
    const data = await this.auditLogsService.findById(id);

    return {
      message: 'لاگ ممیزی دریافت شد',
      data,
    };
  }
}
