import { PERMISSIONS } from '@helali/shared';

import type { PrismaClient } from '@prisma/client';

const PERMISSION_DEFINITIONS: ReadonlyArray<{ name: string; description: string }> = [
  { name: PERMISSIONS.AUDIO_READ, description: 'مشاهده صوت‌ها' },
  { name: PERMISSIONS.AUDIO_CREATE, description: 'ایجاد صوت' },
  { name: PERMISSIONS.AUDIO_UPDATE, description: 'ویرایش صوت' },
  { name: PERMISSIONS.AUDIO_DELETE, description: 'حذف صوت' },
  { name: PERMISSIONS.VIDEO_READ, description: 'مشاهده ویدیوها' },
  { name: PERMISSIONS.VIDEO_CREATE, description: 'ایجاد ویدیو' },
  { name: PERMISSIONS.VIDEO_UPDATE, description: 'ویرایش ویدیو' },
  { name: PERMISSIONS.VIDEO_DELETE, description: 'حذف ویدیو' },
  { name: PERMISSIONS.GALLERY_READ, description: 'مشاهده گالری' },
  { name: PERMISSIONS.GALLERY_CREATE, description: 'ایجاد تصویر' },
  { name: PERMISSIONS.GALLERY_UPDATE, description: 'ویرایش تصویر' },
  { name: PERMISSIONS.GALLERY_DELETE, description: 'حذف تصویر' },
  { name: PERMISSIONS.CATEGORY_MANAGE, description: 'مدیریت دسته‌بندی‌ها' },
  { name: PERMISSIONS.COMMENT_MANAGE, description: 'مدیریت نظرات' },
  { name: PERMISSIONS.TWEET_READ, description: 'مشاهده توییت‌ها' },
  { name: PERMISSIONS.TWEET_CREATE, description: 'ایجاد توییت' },
  { name: PERMISSIONS.TWEET_UPDATE, description: 'ویرایش توییت' },
  { name: PERMISSIONS.TWEET_DELETE, description: 'حذف توییت' },
  { name: PERMISSIONS.USER_READ, description: 'مشاهده کاربران' },
  { name: PERMISSIONS.USER_CREATE, description: 'ایجاد کاربر' },
  { name: PERMISSIONS.USER_UPDATE, description: 'ویرایش کاربر' },
  { name: PERMISSIONS.USER_DELETE, description: 'حذف کاربر' },
  { name: PERMISSIONS.USER_MANAGE, description: 'مدیریت کامل کاربران' },
  { name: PERMISSIONS.USER_MANAGE_ROLES, description: 'مدیریت نقش‌ها و سطح دسترسی' },
  { name: PERMISSIONS.DASHBOARD_READ, description: 'مشاهده داشبورد' },
  { name: PERMISSIONS.AUDIT_READ, description: 'مشاهده لاگ ممیزی' },
];

const ROLE_DEFINITIONS: ReadonlyArray<{
  name: string;
  description: string;
  isSystem: boolean;
  permissions: ReadonlyArray<string>;
}> = [
  {
    name: 'SUPER',
    description: 'دسترسی کامل سیستم',
    isSystem: true,
    permissions: PERMISSION_DEFINITIONS.map((p) => p.name),
  },
  {
    name: 'ADMIN',
    description: 'مدیریت محتوا و کاربران',
    isSystem: true,
    permissions: PERMISSION_DEFINITIONS.map((p) => p.name).filter(
      (name) => name !== PERMISSIONS.USER_MANAGE_ROLES,
    ),
  },
  {
    name: 'USER',
    description: 'دسترسی عمومی',
    isSystem: true,
    permissions: [PERMISSIONS.AUDIO_READ, PERMISSIONS.VIDEO_READ, PERMISSIONS.GALLERY_READ],
  },
  {
    name: 'ADMIN_AUDIO',
    description: 'مدیریت صوت (بدون حذف)',
    isSystem: false,
    permissions: [
      PERMISSIONS.AUDIO_READ,
      PERMISSIONS.AUDIO_UPDATE,
      PERMISSIONS.DASHBOARD_READ,
    ],
  },
];

async function withRetry<T>(operation: () => Promise<T>, label: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code?: string }).code)
          : '';

      if (code !== 'P1017' && code !== 'P1001' && attempt === 3) {
        break;
      }

      console.warn(`${label} failed (attempt ${attempt}/3): ${code || 'unknown'}`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  throw lastError;
}

export async function seedRolesAndPermissions(prisma: PrismaClient): Promise<void> {
  console.log('Seeding permissions...');
  await withRetry(
    () =>
      prisma.permission.createMany({
        data: [...PERMISSION_DEFINITIONS],
        skipDuplicates: true,
      }),
    'permission.createMany',
  );

  console.log('Seeding roles...');
  await withRetry(
    () =>
      prisma.role.createMany({
        data: ROLE_DEFINITIONS.map((role) => ({
          name: role.name,
          description: role.description,
          isSystem: role.isSystem,
        })),
        skipDuplicates: true,
      }),
    'role.createMany',
  );

  const [permissions, roles] = await withRetry(
    () =>
      Promise.all([
        prisma.permission.findMany({ select: { id: true, name: true } }),
        prisma.role.findMany({ select: { id: true, name: true } }),
      ]),
    'load permissions/roles',
  );

  const permissionIdByName = new Map(permissions.map((item) => [item.name, item.id]));
  const roleIdByName = new Map(roles.map((item) => [item.name, item.id]));

  const rolePermissionRows: Array<{ roleId: number; permissionId: number }> = [];

  for (const role of ROLE_DEFINITIONS) {
    const roleId = roleIdByName.get(role.name);

    if (!roleId) {
      continue;
    }

    for (const permissionName of role.permissions) {
      const permissionId = permissionIdByName.get(permissionName);

      if (!permissionId) {
        continue;
      }

      rolePermissionRows.push({ roleId, permissionId });
    }
  }

  console.log(`Linking ${rolePermissionRows.length} role permissions...`);
  await withRetry(
    () =>
      prisma.rolePermission.createMany({
        data: rolePermissionRows,
        skipDuplicates: true,
      }),
    'rolePermission.createMany',
  );
}

export async function getRoleByName(
  prisma: PrismaClient,
  name: string,
): Promise<{ id: number } | null> {
  return prisma.role.findUnique({ where: { name }, select: { id: true } });
}
