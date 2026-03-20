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
  console.log('Seeding countries...');

  // 11 Countries — 8 active, 3 inactive
  await prisma.country.upsert({
    where: { id: 'thailand' },
    update: {},
    create: {
      id: 'thailand',
      name: 'Thailand',
      flag: '🇹🇭',
      creatorsAvail: 1500,
      avgEyeball: '200K-500K',
      avgCPE: '฿0.5-1.2',
      foodBevEng: '7.0%',
      beautyEng: '6.1%',
      snackTrend: '+35% YoY',
      platforms: ['TikTok', 'Facebook', 'Instagram'],
      cats: ['Food & Snack', 'Beauty', 'Health'],
      estReach: '600K-1.5M',
      estOrders: '100-300',
      isActive: true,
    },
  });

  await prisma.country.upsert({
    where: { id: 'vietnam' },
    update: {},
    create: {
      id: 'vietnam',
      name: 'Vietnam',
      flag: '🇻🇳',
      creatorsAvail: 840,
      avgEyeball: '180K-450K',
      avgCPE: '฿0.8-1.5',
      foodBevEng: '6.2%',
      beautyEng: '5.4%',
      snackTrend: '+32% YoY',
      platforms: ['TikTok', 'Facebook', 'Zalo'],
      cats: ['Snack & Food', 'Beauty', 'Health'],
      estReach: '500K-1.2M',
      estOrders: '80-200',
      isActive: true,
    },
  });

  await prisma.country.upsert({
    where: { id: 'malaysia' },
    update: {},
    create: {
      id: 'malaysia',
      name: 'Malaysia',
      flag: '🇲🇾',
      creatorsAvail: 520,
      avgEyeball: '120K-300K',
      avgCPE: '฿1.0-2.0',
      foodBevEng: '5.1%',
      beautyEng: '4.8%',
      snackTrend: '+24% YoY',
      platforms: ['Instagram', 'TikTok', 'Shopee'],
      cats: ['Food', 'Health', 'Beauty'],
      estReach: '300K-800K',
      estOrders: '50-120',
      isActive: true,
    },
  });

  await prisma.country.upsert({
    where: { id: 'laos' },
    update: {},
    create: {
      id: 'laos',
      name: 'Laos',
      flag: '🇱🇦',
      creatorsAvail: 120,
      avgEyeball: '50K-150K',
      avgCPE: '฿0.5-1.0',
      foodBevEng: '7.1%',
      beautyEng: '5.8%',
      snackTrend: '+45% YoY',
      platforms: ['Facebook', 'TikTok'],
      cats: ['Food', 'Lifestyle'],
      estReach: '100K-350K',
      estOrders: '30-80',
      isActive: true,
    },
  });

  await prisma.country.upsert({
    where: { id: 'japan' },
    update: {},
    create: {
      id: 'japan',
      name: 'Japan',
      flag: '🇯🇵',
      creatorsAvail: 380,
      avgEyeball: '200K-600K',
      avgCPE: '฿2.5-4.0',
      foodBevEng: '4.2%',
      beautyEng: '3.9%',
      snackTrend: '+18% YoY',
      platforms: ['Instagram', 'Twitter', 'LINE'],
      cats: ['Food & Snack', 'Beauty', 'Tech'],
      estReach: '600K-1.8M',
      estOrders: '60-150',
      isActive: true,
    },
  });

  await prisma.country.upsert({
    where: { id: 'korea' },
    update: {},
    create: {
      id: 'korea',
      name: 'South Korea',
      flag: '🇰🇷',
      creatorsAvail: 290,
      avgEyeball: '250K-700K',
      avgCPE: '฿2.0-3.5',
      foodBevEng: '5.5%',
      beautyEng: '5.1%',
      snackTrend: '+28% YoY',
      platforms: ['Instagram', 'YouTube', 'KakaoTalk'],
      cats: ['Beauty', 'Food', 'Fashion'],
      estReach: '700K-2M',
      estOrders: '70-180',
      isActive: true,
    },
  });

  await prisma.country.upsert({
    where: { id: 'usa' },
    update: {},
    create: {
      id: 'usa',
      name: 'United States',
      flag: '🇺🇸',
      creatorsAvail: 1200,
      avgEyeball: '300K-900K',
      avgCPE: '฿3.0-5.0',
      foodBevEng: '3.8%',
      beautyEng: '3.5%',
      snackTrend: '+15% YoY',
      platforms: ['Instagram', 'TikTok', 'YouTube'],
      cats: ['Wellness', 'Food', 'Fashion'],
      estReach: '800K-2.5M',
      estOrders: '100-300',
      isActive: true,
    },
  });

  await prisma.country.upsert({
    where: { id: 'uk' },
    update: {},
    create: {
      id: 'uk',
      name: 'United Kingdom',
      flag: '🇬🇧',
      creatorsAvail: 650,
      avgEyeball: '200K-550K',
      avgCPE: '฿2.5-4.0',
      foodBevEng: '4.1%',
      beautyEng: '3.9%',
      snackTrend: '+20% YoY',
      platforms: ['Instagram', 'TikTok', 'Facebook'],
      cats: ['Food', 'Fashion', 'Beauty'],
      estReach: '500K-1.5M',
      estOrders: '60-160',
      isActive: true,
    },
  });

  // Inactive countries (coming soon)
  await prisma.country.upsert({
    where: { id: 'clmv' },
    update: {},
    create: {
      id: 'clmv',
      name: 'CLMV Region',
      flag: '🌏',
      creatorsAvail: 0,
      platforms: [],
      cats: [],
      isActive: false,
    },
  });

  await prisma.country.upsert({
    where: { id: 'australia' },
    update: {},
    create: {
      id: 'australia',
      name: 'Australia',
      flag: '🇦🇺',
      creatorsAvail: 0,
      platforms: [],
      cats: [],
      isActive: false,
    },
  });

  await prisma.country.upsert({
    where: { id: 'eu' },
    update: {},
    create: {
      id: 'eu',
      name: 'EU Region',
      flag: '🇪🇺',
      creatorsAvail: 0,
      platforms: [],
      cats: [],
      isActive: false,
    },
  });

  console.log('Seeding packages...');

  await prisma.package.upsert({
    where: { id: 'starter' },
    update: {},
    create: {
      id: 'starter',
      name: 'Starter',
      badge: null,
      numCreators: 5,
      pricePerCreator: 2500,
      discountPct: 0,
      estReach: '150K-400K',
      estEngagement: '2.5-4.0%',
    },
  });

  await prisma.package.upsert({
    where: { id: 'popular' },
    update: {},
    create: {
      id: 'popular',
      name: 'Popular',
      badge: 'แนะนำ',
      numCreators: 10,
      pricePerCreator: 3500,
      discountPct: 5,
      estReach: '500K-1.2M',
      estEngagement: '3.5-5.5%',
    },
  });

  await prisma.package.upsert({
    where: { id: 'value' },
    update: {},
    create: {
      id: 'value',
      name: 'Value',
      badge: null,
      numCreators: 15,
      pricePerCreator: 4800,
      discountPct: 10,
      estReach: '1.2M-3M',
      estEngagement: '4.0-6.0%',
    },
  });

  console.log('Seeding creators...');

  // 10 main creators
  const mainCreators = [
    { name: 'Linh Tran', niche: 'Beauty & Skincare', engagement: '8.5%', reach: '250K', avatar: '👩🏻', countryFlag: '🇻🇳' },
    { name: 'Salwa Ahmad', niche: 'Food & Lifestyle', engagement: '7.2%', reach: '180K', avatar: '👩🏽', countryFlag: '🇲🇾' },
    { name: 'Luca Rossi', niche: 'Thai Culture', engagement: '9.1%', reach: '320K', avatar: '👨🏻‍🦱', countryFlag: '🇮🇹' },
    { name: 'Mai Nguyen', niche: 'Food Review', engagement: '6.8%', reach: '150K', avatar: '👩🏻', countryFlag: '🇻🇳' },
    { name: 'James Park', niche: 'Lifestyle', engagement: '8.9%', reach: '290K', avatar: '👨🏻', countryFlag: '🇺🇸' },
    { name: 'Aisha Karim', niche: 'Health & Wellness', engagement: '7.5%', reach: '200K', avatar: '👩🏾', countryFlag: '🇲🇾' },
    { name: 'Priya Sharma', niche: 'Travel & Food', engagement: '8.2%', reach: '270K', avatar: '👩🏽‍🦱', countryFlag: '🇮🇳' },
    { name: 'David Kim', niche: 'Fashion', engagement: '7.8%', reach: '230K', avatar: '👨🏻‍🦰', countryFlag: '🇰🇷' },
    { name: 'Nina Williams', niche: 'Beauty', engagement: '9.3%', reach: '340K', avatar: '👩🏿', countryFlag: '🇬🇧' },
    { name: 'Carlos Santos', niche: 'Lifestyle', engagement: '7.9%', reach: '210K', avatar: '👨🏽', countryFlag: '🇧🇷' },
  ];

  // 5 backup creators
  const backupCreators = [
    { name: 'Olivia Turner', niche: 'Skincare', engagement: '6.5%', reach: '140K', avatar: '👩🏼', countryFlag: '🇦🇺' },
    { name: 'Ryan Brooks', niche: 'Fitness', engagement: '7.1%', reach: '190K', avatar: '👨🏾', countryFlag: '🇺🇸' },
    { name: 'Maya Lee', niche: 'Fashion', engagement: '8.0%', reach: '220K', avatar: '👩🏻‍🦰', countryFlag: '🇰🇷' },
    { name: 'Kevin Nguyen', niche: 'Tech', engagement: '6.9%', reach: '165K', avatar: '👨🏻', countryFlag: '🇻🇳' },
    { name: 'Zara Ahmed', niche: 'Beauty', engagement: '7.7%', reach: '205K', avatar: '👩🏽‍🦱', countryFlag: '🇲🇾' },
  ];

  for (const creator of mainCreators) {
    await prisma.creator.upsert({
      where: { id: `main-${creator.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `main-${creator.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...creator,
        isBackup: false,
      },
    });
  }

  for (const creator of backupCreators) {
    await prisma.creator.upsert({
      where: { id: `backup-${creator.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `backup-${creator.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...creator,
        isBackup: true,
      },
    });
  }

  // ── Dev test data ──────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    console.log('Seeding dev test data...');

    const devUser = await prisma.user.upsert({
      where: { email: 'dev@kollabglobal.com' },
      update: {},
      create: {
        id: 'dev-user-1',
        name: 'Dev User',
        email: 'dev@kollabglobal.com',
      },
    });

    const devCampaign = await prisma.campaign.upsert({
      where: { id: 'dev-campaign-1' },
      update: {},
      create: {
        id: 'dev-campaign-1',
        userId: devUser.id,
        countryId: 'vietnam',
        packageId: 'popular',
        promotionType: 'PRODUCT',
        status: 'DRAFT',
      },
    });

    await prisma.campaignProduct.upsert({
      where: { campaignId: devCampaign.id },
      update: {},
      create: {
        campaignId: devCampaign.id,
        brandName: 'KOLLAB Global',
        productName: 'มะม่วงอบแห้ง Premium',
        category: 'Food & Snack',
        description: 'มะม่วงอบแห้งคัดพิเศษจากเชียงราย รสชาติหวานอมเปรี้ยว ไม่มีสารกันบูด',
        sellingPoints: 'ออร์แกนิค 100% | ไม่มีน้ำตาลเพิ่ม | บรรจุถุงซิปล็อก | ส่งตรงจากสวน',
        isService: false,
        url: 'https://kollabglobal.com/dried-mango',
      },
    });

    console.log(`  - Dev campaign ID: ${devCampaign.id}`);
    console.log(`  - Visit: /campaigns/${devCampaign.id}/brief/new`);
  }

  console.log('Seed complete!');
  console.log('  - 11 countries (8 active, 3 inactive)');
  console.log('  - 3 packages');
  console.log('  - 15 creators (10 main, 5 backup)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
