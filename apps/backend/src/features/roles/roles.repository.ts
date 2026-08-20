import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
      select: { id: true, name: true },
    });
  }

  async listPermissions() {
    return this.prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findPermissionsByIds(permissionIds: ReadonlyArray<number>) {
    return this.prisma.permission.findMany({
      where: { id: { in: [...permissionIds] } },
      select: { id: true },
    });
  }

  async create(input: {
    readonly name: string;
    readonly description: string;
    readonly permissionIds: ReadonlyArray<number>;
  }) {
    return this.prisma.role.create({
      data: {
        name: input.name,
        description: input.description,
        permissions: {
          create: input.permissionIds.map((permissionId) => ({
            permissionId,
          })),
        },
      },
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async update(
    id: number,
    input: {
      readonly description?: string;
      readonly permissionIds?: ReadonlyArray<number>;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (input.permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        await tx.rolePermission.createMany({
          data: input.permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        });
      }

      return tx.role.update({
        where: { id },
        data: {
          ...(input.description !== undefined ? { description: input.description } : {}),
        },
        include: {
          permissions: {
            include: { permission: true },
          },
          _count: {
            select: { users: true },
          },
        },
      });
    });
  }

  async delete(id: number) {
    return this.prisma.role.delete({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });
  }
}
