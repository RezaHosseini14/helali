import { Injectable } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';

import { PrismaService } from '@/shared/prisma/prisma.service';

const userAuthSelect = {
  id: true,
  username: true,
  passwordHash: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  age: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

export type IUserAuthRecord = Prisma.UserGetPayload<{
  select: typeof userAuthSelect;
}>;

type IRefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: {
    user: {
      select: typeof userAuthSelect;
    };
  };
}>;

export interface ICreateUserData {
  readonly username: string;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly age?: number;
  readonly email?: string;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByUsername(username: string): Promise<IUserAuthRecord | null> {
    return this.prisma.user.findUnique({
      where: { username },
      select: userAuthSelect,
    });
  }

  async findUserByPhoneNumber(phoneNumber: string): Promise<{ id: number } | null> {
    return this.prisma.user.findFirst({
      where: { phoneNumber },
      select: { id: true },
    });
  }

  async findUserById(id: number): Promise<IUserAuthRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userAuthSelect,
    });
  }

  async createUser(data: ICreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        username: data.username,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        age: data.age,
        email: data.email,
      },
    });
  }

  async createRefreshToken(userId: number, token: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findRefreshTokenWithUser(token: string): Promise<IRefreshTokenWithUser | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: userAuthSelect,
        },
      },
    });
  }

  async rotateRefreshToken(
    oldToken: string,
    userId: number,
    newToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: { token: oldToken, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: { userId, token: newToken, expiresAt },
      }),
    ]);
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
