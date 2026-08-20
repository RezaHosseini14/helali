import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  isSuperRole,
  isSystemRole,
  normalizeRoleName,
  type ICreateRoleInput,
  type IPermission,
  type IRoleDetail,
  type IUpdateRoleInput,
} from '@helali/shared';

import { AuditLogsService } from '@/features/audit-logs/audit-logs.service';
import type { IAuthenticatedUser } from '@/shared/types/auth.types';

import { RolesRepository } from './roles.repository';

type RoleRecord = NonNullable<Awaited<ReturnType<RolesRepository['findById']>>>;

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(): Promise<ReadonlyArray<IRoleDetail>> {
    const roles = await this.rolesRepository.findMany();
    return roles.map((role) => this.mapRoleDetail(role));
  }

  async findById(id: number): Promise<IRoleDetail> {
    const role = await this.rolesRepository.findById(id);

    if (!role) {
      throw new NotFoundException('نقش یافت نشد');
    }

    return this.mapRoleDetail(role);
  }

  async listPermissions(): Promise<ReadonlyArray<IPermission>> {
    return this.rolesRepository.listPermissions();
  }

  async create(input: ICreateRoleInput, actor: IAuthenticatedUser): Promise<IRoleDetail> {
    const name = normalizeRoleName(input.name);

    if (isSystemRole(name)) {
      throw new BadRequestException('نمی‌توان نقش با نام سیستمی ایجاد کرد');
    }

    const existing = await this.rolesRepository.findByName(name);

    if (existing) {
      throw new ConflictException('نقشی با این نام از قبل وجود دارد');
    }

    const permissionIds = await this.assertPermissionIds(input.permissionIds);

    const role = await this.rolesRepository.create({
      name,
      description: input.description.trim(),
      permissionIds,
    });

    void this.auditLogsService.create({
      action: 'roles.create',
      entityType: 'Role',
      entityId: String(role.id),
      userId: actor.id,
      changes: {
        name: role.name,
        description: role.description,
        permissionIds,
      },
    });

    return this.mapRoleDetail(role);
  }

  async update(
    id: number,
    input: IUpdateRoleInput,
    actor: IAuthenticatedUser,
  ): Promise<IRoleDetail> {
    const existing = await this.rolesRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('نقش یافت نشد');
    }

    if (isSuperRole(existing.name)) {
      throw new BadRequestException('دسترسی‌های نقش SUPER قابل تغییر نیست');
    }

    if (input.description === undefined && input.permissionIds === undefined) {
      throw new BadRequestException('حداقل یک فیلد برای به‌روزرسانی لازم است');
    }

    const permissionIds =
      input.permissionIds !== undefined
        ? await this.assertPermissionIds(input.permissionIds)
        : undefined;

    const role = await this.rolesRepository.update(id, {
      description: input.description?.trim(),
      permissionIds,
    });

    void this.auditLogsService.create({
      action: 'roles.update',
      entityType: 'Role',
      entityId: String(role.id),
      userId: actor.id,
      changes: {
        description: input.description,
        permissionIds,
      },
    });

    return this.mapRoleDetail(role);
  }

  async remove(id: number, actor: IAuthenticatedUser): Promise<IRoleDetail> {
    const existing = await this.rolesRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('نقش یافت نشد');
    }

    if (isSystemRole(existing.name)) {
      throw new BadRequestException('نقش‌های سیستمی قابل حذف نیستند');
    }

    if (existing._count.users > 0) {
      throw new BadRequestException('نقش دارای کاربر قابل حذف نیست');
    }

    const role = await this.rolesRepository.delete(id);

    void this.auditLogsService.create({
      action: 'roles.delete',
      entityType: 'Role',
      entityId: String(role.id),
      userId: actor.id,
      changes: {
        name: role.name,
      },
    });

    return this.mapRoleDetail(role);
  }

  private async assertPermissionIds(
    permissionIds: ReadonlyArray<number>,
  ): Promise<ReadonlyArray<number>> {
    const uniqueIds = [...new Set(permissionIds)];
    const found = await this.rolesRepository.findPermissionsByIds(uniqueIds);

    if (found.length !== uniqueIds.length) {
      throw new BadRequestException('یک یا چند دسترسی نامعتبر است');
    }

    return uniqueIds;
  }

  private mapRoleDetail(role: RoleRecord): IRoleDetail {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: isSystemRole(role.name) || role.isSystem,
      permissions: role.permissions.map((item) => ({
        id: item.permission.id,
        name: item.permission.name,
        description: item.permission.description,
      })),
      userCount: role._count.users,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  }
}
