import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/role.decorator';
import { RoleGuard } from 'src/common/guard/roles.guard';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Role } from 'src/common/enums/role.enums';
import { AuditLogService } from './auditLog.service';

@Controller('auditlog')
@ApiTags('AuditLog')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(Role.SUPER)
  @UseGuards(AuthGuard, RoleGuard)
  findAll(@Query() query) {
    const { page, limit } = query;
    return this.auditLogService.findAll(page, limit);
  }
}
