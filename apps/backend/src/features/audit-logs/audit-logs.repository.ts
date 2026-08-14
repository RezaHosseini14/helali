import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '@/shared/prisma/prisma.service';

export interface ICreateAuditLogInput {
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly userId?: number | null;
  readonly changes?: Prisma.InputJsonValue | null;
  readonly ipAddress?: string | null;
}

export interface IListAuditLogsInput {
  readonly page: number;
  readonly limit: number;
  readonly action?: string;
  readonly entityType?: string;
  readonly userId?: number;
  readonly search?: string;
  readonly from?: string;
  readonly to?: string;
}

const AUDIT_LOG_USER_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
} as const;

export type IAuditLogRecord = {
  readonly id: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly userId: number | null;
  readonly changes: Prisma.JsonValue;
  readonly ipAddress: string | null;
  readonly createdAt: Date;
  readonly user: {
    readonly id: number;
    readonly username: string;
    readonly firstName: string;
    readonly lastName: string;
  } | null;
};

@Injectable()
export class AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: ICreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        userId: input.userId ?? null,
        changes: input.changes ?? undefined,
        ipAddress: input.ipAddress ?? null,
      },
      include: {
        user: {
          select: AUDIT_LOG_USER_SELECT,
        },
      },
    });
  }

  async findMany(input: IListAuditLogsInput): Promise<{ items: IAuditLogRecord[]; total: number }> {
    const where = this.buildWhere(input);
    const skip = (input.page - 1) * input.limit;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: AUDIT_LOG_USER_SELECT,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: input.limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: AUDIT_LOG_USER_SELECT,
        },
      },
    });
  }

  private buildWhere(input: IListAuditLogsInput): Prisma.AuditLogWhereInput {
    const filters: Prisma.AuditLogWhereInput[] = [];

    if (input.action) {
      filters.push({
        action: { contains: input.action, mode: 'insensitive' },
      });
    }

    if (input.entityType) {
      filters.push({
        entityType: { contains: input.entityType, mode: 'insensitive' },
      });
    }

    if (input.userId !== undefined) {
      filters.push({ userId: input.userId });
    }

    if (input.search) {
      filters.push({
        OR: [
          { action: { contains: input.search, mode: 'insensitive' } },
          { entityType: { contains: input.search, mode: 'insensitive' } },
          { entityId: { contains: input.search, mode: 'insensitive' } },
          { ipAddress: { contains: input.search, mode: 'insensitive' } },
          {
            user: {
              OR: [
                { username: { contains: input.search, mode: 'insensitive' } },
                { firstName: { contains: input.search, mode: 'insensitive' } },
                { lastName: { contains: input.search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      });
    }

    if (input.from || input.to) {
      filters.push({
        createdAt: {
          ...(input.from ? { gte: new Date(input.from) } : {}),
          ...(input.to ? { lte: new Date(input.to) } : {}),
        },
      });
    }

    if (filters.length === 0) {
      return {};
    }

    return { AND: filters };
  }
}
