import { Injectable } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';

import { PrismaService } from '@/shared/prisma/prisma.service';

const userSelect = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  age: true,
  email: true,
  roleId: true,
  createdAt: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export type IUserRecord = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

export interface IListUsersInput {
  readonly page: number;
  readonly limit: number;
}

export interface IUpdateUserData {
  readonly username?: string;
  readonly passwordHash?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phoneNumber?: string;
  readonly age?: number;
  readonly email?: string | null;
  readonly roleId?: number;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(input: IListUsersInput) {
    const skip = (input.page - 1) * input.limit;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        select: userSelect,
        orderBy: { id: 'desc' },
        skip,
        take: input.limit,
      }),
      this.prisma.user.count(),
    ]);

    return { items, total };
  }

  async findById(id: number): Promise<IUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  async findByUsername(username: string): Promise<{ id: number } | null> {
    return this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<{ id: number } | null> {
    return this.prisma.user.findFirst({
      where: { phoneNumber },
      select: { id: true },
    });
  }

  async findByIdWithPassword(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        ...userSelect,
        passwordHash: true,
      },
    });
  }

  async findRoleById(id: number) {
    return this.prisma.role.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
  }

  async listRolesForAssignment() {
    return this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: number, data: IUpdateUserData): Promise<IUserRecord> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  async delete(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async countAll(): Promise<number> {
    return this.prisma.user.count();
  }

  async countAudios(): Promise<number> {
    return this.prisma.audio.count();
  }

  async countVideos(): Promise<number> {
    return this.prisma.video.count();
  }

  async countGalleries(): Promise<number> {
    return this.prisma.gallery.count();
  }

  async countComments(): Promise<number> {
    const [audioComments, galleryComments, videoComments] = await Promise.all([
      this.prisma.audioComment.count(),
      this.prisma.galleryComment.count(),
      this.prisma.videoComment.count(),
    ]);

    return audioComments + galleryComments + videoComments;
  }
}
