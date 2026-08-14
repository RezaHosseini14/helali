import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import type { IAuditLog, IPaginatedResponse } from '@helali/shared';

import {
  AuditLogsRepository,
  type IAuditLogRecord,
  type ICreateAuditLogInput,
  type IListAuditLogsInput,
} from './audit-logs.repository';

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async create(input: ICreateAuditLogInput): Promise<IAuditLog> {
    const auditLog = await this.auditLogsRepository.create(input);
    return this.mapAuditLog(auditLog);
  }

  async findAll(input: IListAuditLogsInput): Promise<IPaginatedResponse<IAuditLog>> {
    const { items, total } = await this.auditLogsRepository.findMany(input);

    return {
      items: items.map((item: IAuditLogRecord) => this.mapAuditLog(item)),
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.limit)),
    };
  }

  async findById(id: string): Promise<IAuditLog> {
    const auditLog = await this.auditLogsRepository.findById(id);

    if (!auditLog) {
      throw new NotFoundException('لاگ ممیزی یافت نشد');
    }

    return this.mapAuditLog(auditLog);
  }

  private mapAuditLog(auditLog: IAuditLogRecord): IAuditLog {
    return {
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      userId: auditLog.userId,
      changes: this.mapChanges(auditLog.changes),
      ipAddress: auditLog.ipAddress,
      createdAt: auditLog.createdAt.toISOString(),
      user: auditLog.user,
    };
  }

  private mapChanges(changes: Prisma.JsonValue): Record<string, unknown> | null {
    if (changes === null || changes === undefined) {
      return null;
    }

    if (typeof changes !== 'object' || Array.isArray(changes)) {
      return { value: changes };
    }

    return changes as Record<string, unknown>;
  }
}
