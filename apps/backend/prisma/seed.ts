import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await argon2.hash('admin123');

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      firstName: 'مدیر',
      lastName: 'سیستم',
      phoneNumber: '09120000000',
      email: 'admin@helali.ir',
      role: UserRole.SUPER,
    },
  });

  const categories = [
    { title: 'مداحی', sort: 1 },
    { title: 'سخنرانی', sort: 2 },
    { title: 'reels', sort: 3 },
  ];

  for (const category of categories) {
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
