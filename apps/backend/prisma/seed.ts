import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

import { getRoleByName, seedRolesAndPermissions } from './seeds/roles.seed';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main(): Promise<void> {
  console.log('Connecting to database...');
  await prisma.$connect();

  await seedRolesAndPermissions(prisma);

  console.log('Ensuring admin user...');
  const superRole = await getRoleByName(prisma, 'SUPER');

  if (!superRole) {
    throw new Error('SUPER role not found after seed');
  }

  const passwordHash = await argon2.hash('admin123');

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      roleId: superRole.id,
    },
    create: {
      username: 'admin',
      passwordHash,
      firstName: 'مدیر',
      lastName: 'سیستم',
      phoneNumber: '09120000000',
      email: 'admin@helali.ir',
      roleId: superRole.id,
    },
  });

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
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
