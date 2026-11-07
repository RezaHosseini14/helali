/**
 * Production-safe seed (CommonJS, no ts-node).
 * Idempotent: safe to re-run on every deploy.
 * Does NOT reset admin password if the user already exists.
 */
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const { PERMISSIONS } = require('@helali/shared');

const PERMISSION_DEFINITIONS = [
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
].filter((item) => Boolean(item.name));

const ROLE_DEFINITIONS = [
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
    permissions: [PERMISSIONS.AUDIO_READ, PERMISSIONS.AUDIO_UPDATE, PERMISSIONS.DASHBOARD_READ],
  },
];

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();

    console.log('Seeding permissions...');
    await prisma.permission.createMany({
      data: PERMISSION_DEFINITIONS,
      skipDuplicates: true,
    });

    console.log('Seeding roles...');
    await prisma.role.createMany({
      data: ROLE_DEFINITIONS.map((role) => ({
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
      })),
      skipDuplicates: true,
    });

    const [permissions, roles] = await Promise.all([
      prisma.permission.findMany({ select: { id: true, name: true } }),
      prisma.role.findMany({ select: { id: true, name: true } }),
    ]);

    const permissionIdByName = new Map(permissions.map((item) => [item.name, item.id]));
    const roleIdByName = new Map(roles.map((item) => [item.name, item.id]));

    const rolePermissionRows = [];
    for (const role of ROLE_DEFINITIONS) {
      const roleId = roleIdByName.get(role.name);
      if (!roleId) continue;
      for (const permissionName of role.permissions) {
        const permissionId = permissionIdByName.get(permissionName);
        if (!permissionId) continue;
        rolePermissionRows.push({ roleId, permissionId });
      }
    }

    console.log(`Linking ${rolePermissionRows.length} role permissions...`);
    if (rolePermissionRows.length > 0) {
      await prisma.rolePermission.createMany({
        data: rolePermissionRows,
        skipDuplicates: true,
      });
    }

    const superRole = await prisma.role.findUnique({ where: { name: 'SUPER' } });
    if (!superRole) {
      throw new Error('SUPER role not found after seed');
    }

    const existingAdmin = await prisma.user.findUnique({ where: { username: 'admin' } });
    if (!existingAdmin) {
      console.log('Creating default admin user...');
      const passwordHash = await argon2.hash('admin123');
      await prisma.user.create({
        data: {
          username: 'admin',
          passwordHash,
          firstName: 'Admin',
          lastName: 'System',
          phoneNumber: '09120000000',
          email: 'admin@helali.ir',
          roleId: superRole.id,
        },
      });
    } else {
      console.log('Admin user already exists — leaving password unchanged');
      await prisma.user.update({
        where: { username: 'admin' },
        data: { roleId: superRole.id },
      });
    }

    console.log('Seeding categories...');
    for (const category of [
      { title: 'مداحی', sort: 1 },
      { title: 'سخنرانی', sort: 2 },
      { title: 'reels', sort: 3 },
    ]) {
      await prisma.category.upsert({
        where: { sort: category.sort },
        update: { title: category.title },
        create: category,
      });
    }

    console.log('Seed completed');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
