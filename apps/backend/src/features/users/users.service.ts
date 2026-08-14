import {

  BadRequestException,

  ForbiddenException,

  Injectable,

  InternalServerErrorException,

  NotFoundException,

} from '@nestjs/common';

import * as argon2 from 'argon2';



import { createAppAbility, type IPaginatedResponse, type IUser } from '@helali/shared';



import {

  BadRequestMessage,

  NotFoundMessage,

} from '@/shared/constants/messages';

import type { IAuthenticatedUser } from '@/shared/types/auth.types';



import { AccessTokenRevocationService } from '@/features/auth/access-token-revocation.service';
import { AuthRepository } from '@/features/auth/auth.repository';
import { AuditLogsService } from '@/features/audit-logs/audit-logs.service';



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

      role: user.role as IUser['role'],

      createdAt: new Date().toISOString(),

    };

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



    if (dto.role !== undefined && dto.role !== existing.role) {

      this.assertCanManageUsers(actor);

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

        ...(dto.role !== undefined ? { role: dto.role } : {}),

      });



      if (passwordHash !== undefined || (dto.role !== undefined && dto.role !== existing.role)) {

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
          ...(dto.role !== undefined ? { role: user.role } : {}),
          ...(passwordHash !== undefined ? { passwordChanged: true } : {}),
        },
      });

      return this.mapUser(user);

    } catch {

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



    if (!ability.can('manage', 'User')) {

      throw new ForbiddenException('Insufficient permissions');

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

      role: user.role,

      createdAt: user.createdAt.toISOString(),

    };

  }

}


