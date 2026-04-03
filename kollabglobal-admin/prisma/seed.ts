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
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
