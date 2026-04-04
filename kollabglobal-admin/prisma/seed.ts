import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;

  if (!email) {
    console.log('ADMIN_EMAIL not set, skipping admin seed');
    return;
  }

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`Admin user seeded: ${email}`);

  // Dev-only: seed a next-auth User so /api/dev/login works without Google OAuth
  if (process.env.NODE_ENV !== 'production') {
    await prisma.user.upsert({
      where: { id: 'dev-admin-1' },
      update: {},
      create: {
        id: 'dev-admin-1',
        email,
        name: 'Dev Admin',
      },
    });
    console.log('Dev admin User seeded: dev-admin-1');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
