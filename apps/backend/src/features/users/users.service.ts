import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import {
  createAppAbility,
  isSuperRole,
  type IPaginatedResponse,
  type IRole,
  type IUser,
} from '@helali/shared';

import { AccessTokenRevocationService } from '@/features/auth/access-token-revocation.service';
import { AuthRepository } from '@/features/auth/auth.repository';
import { AuditLogsService } from '@/features/audit-logs/audit-logs.service';
import {
  AuthMessage,
  BadRequestMessage,
  NotFoundMessage,
} from '@/shared/constants/messages';
import type { IAuthenticatedUser } from '@/shared/types/auth.types';

import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository, type IUserRecord } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
    private readonly accessTokenRevocationService: AccessTokenRevocationService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(page: number, limit: number): Promise<IPaginatedResponse<IUser>> {
    const { items, total } = await this.usersRepository.findMany({ page, limit });

    if (items.length === 0) {
      throw new NotFoundException(NotFoundMessage.NotFoundUser);
    }

    return {
      items: items.map((item) => this.mapUser(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(
    dto: CreateUserDto,
    actor: IAuthenticatedUser,
    ipAddress?: string,
  ): Promise<IUser> {
    this.assertCanManageUsers(actor);

    if (dto.password !== dto.confirmPassword) {
      throw new ConflictException(BadRequestMessage.PasswordMismatch);
    }

    const existingPhone = await this.usersRepository.findByPhoneNumber(dto.phoneNumber);

    if (existingPhone) {
      throw new ConflictException(AuthMessage.UserAlreadyExists);
    }

    const existingUsername = await this.usersRepository.findByUsername(dto.username);

    if (existingUsername) {
      throw new ConflictException(AuthMessage.UserAlreadyExists);
    }

    let roleId = dto.roleId;

    if (roleId !== undefined) {
      await this.assertCanAssignRole(actor, roleId);
    } else {
      const defaultRoleId = await this.authRepository.findDefaultUserRoleId();

      if (!defaultRoleId) {
        throw new InternalServerErrorException(BadRequestMessage.FailedUpdate);
      }

      roleId = defaultRoleId;
    }

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    const created = await this.authRepository.createUser({
      username: dto.username,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      age: dto.age,
      email: dto.email,
      roleId,
    });

    const user = await this.usersRepository.findById(created.id);

    if (!user) {
      throw new InternalServerErrorException(BadRequestMessage.FailedUpdate);
    }

    void this.auditLogsService.create({
      action: 'users.create',
      entityType: 'User',
      entityId: String(user.id),
      userId: actor.id,
      ipAddress: ipAddress ?? null,
      changes: {
        username: user.username,
        roleId: user.roleId,
        role: user.role.name,
      },
    });

    return this.mapUser(user);
  }

  async findById(id: number): Promise<IUser> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(NotFoundMessage.NotFoundUser);
    }

    return this.mapUser(user);
  }

  getProfile(user: IAuthenticatedUser): IUser {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      roleId: user.roleId,
      role: user.role,
      createdAt: new Date().toISOString(),
    };
  }

  async listRolesForAssignment(actor: IAuthenticatedUser): Promise<ReadonlyArray<IRole>> {
    this.assertCanManageUsers(actor);

    const roles = await this.usersRepository.listRolesForAssignment();

    return roles
      .filter((role) => isSuperRole(actor.role) || !isSuperRole(role.name))
      .map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      }));
  }

  async getAllDataCount() {
    const [users, audios, videos, galleries, comments] = await Promise.all([
      this.usersRepository.countAll(),
      this.usersRepository.countAudios(),
      this.usersRepository.countVideos(),
      this.usersRepository.countGalleries(),
      this.usersRepository.countComments(),
    ]);

    return {
      users,
      audios,
      videos,
      galleries,
      comments,
    };
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    actor: IAuthenticatedUser,
    ipAddress?: string,
  ): Promise<IUser> {
    const existing = await this.usersRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(NotFoundMessage.NotFoundUser);
    }

    if (dto.roleId !== undefined && dto.roleId !== existing.roleId) {
      this.assertCanManageUsers(actor);
      await this.assertCanAssignRole(actor, dto.roleId);
    }

    const passwordHash = dto.password
      ? await argon2.hash(dto.password, { type: argon2.argon2id })
      : undefined;

    try {
      const user = await this.usersRepository.update(id, {
        ...(dto.username !== undefined ? { username: dto.username } : {}),
        ...(passwordHash !== undefined ? { passwordHash } : {}),
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
        ...(dto.phoneNumber !== undefined ? { phoneNumber: dto.phoneNumber } : {}),
        ...(dto.age !== undefined ? { age: dto.age } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.roleId !== undefined ? { roleId: dto.roleId } : {}),
      });

      if (passwordHash !== undefined || (dto.roleId !== undefined && dto.roleId !== existing.roleId)) {
        await this.revokeUserSessions(id);
      }

      void this.auditLogsService.create({
        action: 'users.update',
        entityType: 'User',
        entityId: String(id),
        userId: actor.id,
        ipAddress: ipAddress ?? null,
        changes: {
          ...(dto.username !== undefined ? { username: user.username } : {}),
          ...(dto.firstName !== undefined ? { firstName: user.firstName } : {}),
          ...(dto.lastName !== undefined ? { lastName: user.lastName } : {}),
          ...(dto.roleId !== undefined ? { roleId: user.roleId, role: user.role.name } : {}),
          ...(passwordHash !== undefined ? { passwordChanged: true } : {}),
        },
      });

      return this.mapUser(user);
    } catch (error: unknown) {
      if (error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(BadRequestMessage.FailedUpdate);
    }
  }

  async remove(
    id: number,
    actor: IAuthenticatedUser,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    if (actor.id === id) {
      throw new BadRequestException('نمی تواندی خودتان را حذف کنید');
    }

    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('کاربر موردنظر یافت نشد');
    }

    await this.usersRepository.delete(id);

    await this.revokeUserSessions(id);

    void this.auditLogsService.create({
      action: 'users.delete',
      entityType: 'User',
      entityId: String(id),
      userId: actor.id,
      ipAddress: ipAddress ?? null,
      changes: { username: user.username, deleted: true },
    });

    return { message: 'کاربر حذف شد' };
  }

  private assertCanManageUsers(actor: IAuthenticatedUser): void {
    const ability = createAppAbility({
      id: actor.id,
      role: actor.role,
      permissions: actor.permissions,
    });

    if (!ability.can('manage', 'User') && !ability.can('manageRoles', 'User')) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  private async assertCanAssignRole(
    actor: IAuthenticatedUser,
    roleId: number,
  ): Promise<void> {
    const role = await this.usersRepository.findRoleById(roleId);

    if (!role) {
      throw new BadRequestException('نقش انتخاب‌شده معتبر نیست');
    }

    if (isSuperRole(role.name) && !isSuperRole(actor.role)) {
      throw new ForbiddenException('فقط SUPER می‌تواند نقش SUPER را اختصاص دهد');
    }
  }

  private async revokeUserSessions(userId: number): Promise<void> {
    this.accessTokenRevocationService.revokeUserSessions(userId);
    await this.authRepository.revokeAllUserTokens(userId);
  }

  private mapUser(user: IUserRecord): IUser {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      age: user.age,
      email: user.email,
      roleId: user.roleId,
      role: user.role.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
