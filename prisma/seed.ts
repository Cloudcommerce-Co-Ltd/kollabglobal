import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function futureDate(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function main() {
  console.log('Seeding countries...');

  // 11 Countries — 8 active, 3 inactive
  await prisma.country.upsert({
    where: { id: 1 },
    update: { region: 'asia', languageCode: 'th', languageName: 'Thai' },
    create: {
      id: 1,
      name: 'Thailand',
      countryCode: 'TH',
      region: 'asia',
      languageCode: 'th',
      languageName: 'Thai',
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
    where: { id: 2 },
    update: { region: 'asia', languageCode: 'vi', languageName: 'Vietnamese' },
    create: {
      id: 2,
      name: 'Vietnam',
      countryCode: 'VN',
      region: 'asia',
      languageCode: 'vi',
      languageName: 'Vietnamese',
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
    where: { id: 3 },
    update: { region: 'asia', languageCode: 'ms', languageName: 'Malay' },
    create: {
      id: 3,
      name: 'Malaysia',
      countryCode: 'MY',
      region: 'asia',
      languageCode: 'ms',
      languageName: 'Malay',
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
    where: { id: 4 },
    update: { region: 'asia', languageCode: 'lo', languageName: 'Lao' },
    create: {
      id: 4,
      name: 'Laos',
      countryCode: 'LA',
      region: 'asia',
      languageCode: 'lo',
      languageName: 'Lao',
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
    where: { id: 5 },
    update: { region: 'asia', languageCode: 'ja', languageName: 'Japanese' },
    create: {
      id: 5,
      name: 'Japan',
      countryCode: 'JP',
      region: 'asia',
      languageCode: 'ja',
      languageName: 'Japanese',
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
    where: { id: 6 },
    update: { region: 'asia', languageCode: 'ko', languageName: 'Korean' },
    create: {
      id: 6,
      name: 'South Korea',
      countryCode: 'KR',
      region: 'asia',
      languageCode: 'ko',
      languageName: 'Korean',
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
    where: { id: 7 },
    update: { region: 'global', languageCode: 'en', languageName: 'English' },
    create: {
      id: 7,
      name: 'United States',
      countryCode: 'US',
      region: 'global',
      languageCode: 'en',
      languageName: 'English',
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
    where: { id: 8 },
    update: { region: 'global', languageCode: 'en', languageName: 'English' },
    create: {
      id: 8,
      name: 'United Kingdom',
      countryCode: 'GB',
      region: 'global',
      languageCode: 'en',
      languageName: 'English',
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
    where: { id: 9 },
    update: { region: 'global', languageCode: 'en', languageName: 'English' },
    create: {
      id: 9,
      name: 'CLMV Region',
      countryCode: 'XX',
      region: 'global',
      languageCode: 'en',
      languageName: 'English',
      creatorsAvail: 0,
      platforms: [],
      cats: [],
      isActive: false,
    },
  });

  await prisma.country.upsert({
    where: { id: 10 },
    update: { region: 'global', languageCode: 'en', languageName: 'English' },
    create: {
      id: 10,
      name: 'Australia',
      countryCode: 'AU',
      region: 'global',
      languageCode: 'en',
      languageName: 'English',
      creatorsAvail: 0,
      platforms: [],
      cats: [],
      isActive: false,
    },
  });

  await prisma.country.upsert({
    where: { id: 11 },
    update: { region: 'global', languageCode: 'en', languageName: 'English' },
    create: {
      id: 11,
      name: 'EU Region',
      countryCode: 'EU',
      region: 'global',
      languageCode: 'en',
      languageName: 'English',
      creatorsAvail: 0,
      platforms: [],
      cats: [],
      isActive: false,
    },
  });

  console.log('Seeding packages...');

  const packages = [
    {
      id: 1,
      name: 'The Passport',
      tagline: 'เริ่มต้นออกสู่ตลาดโลก',
      badge: null,
      numCreators: 5,
      price: 12500,
      platforms: ['tiktok', 'facebook'],
      deliverables: ['TikTok 1 วิดีโอ (15–60 วิ)', 'Facebook 2 โพสต์'],
      cpmLabel: '฿41 / 1K reach',
      cpmSavings: '76%',
      estReach: '150K-400K',
      estEngagement: '2.5-4.0%',
    },
    {
      id: 2,
      name: 'The Global Bridge',
      tagline: 'ขยายฐานข้ามแพลตฟอร์ม',
      badge: 'แนะนำ',
      numCreators: 10,
      price: 33250,
      platforms: ['tiktok', 'instagram'],
      deliverables: ['TikTok 1 วิดีโอ (15–60 วิ)', 'IG 1 reel + 3 stories'],
      cpmLabel: '฿39 / 1K reach',
      cpmSavings: '77%',
      estReach: '500K-1.2M',
      estEngagement: '3.5-5.5%',
    },
    {
      id: 3,
      name: 'The World Dominator',
      tagline: 'ครองทุกแพลตฟอร์มพร้อมกัน',
      badge: null,
      numCreators: 14,
      price: 64800,
      platforms: ['tiktok', 'instagram', 'facebook'],
      deliverables: ['TikTok 1 วิดีโอ (15–60 วิ)', 'IG 1 reel + 3 stories', 'Facebook 2 โพสต์'],
      cpmLabel: '฿30 / 1K reach',
      cpmSavings: '82%',
      estReach: '1.2M-3M',
      estEngagement: '4.0-6.0%',
    },
  ];

  for (const pkg of packages) {
    const { id, ...data } = pkg;
    await prisma.package.upsert({ where: { id }, update: data, create: pkg });
  }

  console.log('Seeding creators...');

  // Clear existing creators (cascade-safe: CampaignCreator references are dev-only)
  await prisma.campaignCreator.deleteMany({});
  await prisma.creator.deleteMany({});

  const codeToCountryId: Record<string, number> = {
    TH: 1,
    VN: 2,
    MY: 3,
    LA: 4,
    JP: 5,
    KR: 6,
    US: 7,
    GB: 8,
    AU: 10,
  };

  type CreatorInput = {
    name: string;
    niche: string;
    engagement: string;
    reach: string;
    avatar: string;
    countryCode: string;
    platform: string;
    socialHandle: string;
    portfolioUrl?: string;
  };

  // 28 main creators
  const mainCreators: CreatorInput[] = [
    // ── The Passport (คนไทยในต่างประเทศ) ──────────────────────────────────────
    {
      name: 'Kelly',
      niche: 'The Passport',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/7323230870722822150~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=f42b8ada&x-expires=1774411200&x-signature=gwQBnGazksEjFqdVKzUBZQwkXVo%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'jutamatketkaew',
    },
    {
      name: 'J',
      niche: 'The Passport',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/0984c48fb8c96aa1fd77a3dbde0c8919~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=950d55b8&x-expires=1774411200&x-signature=ikX8DwWqmqrRlsPap8HYg0RbcrU%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'korbfa',
    },
    {
      name: 'Neen',
      niche: 'The Passport',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/d274464d9846c4b66080f74c7cee2f69~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=9b1f21d9&x-expires=1774411200&x-signature=i%2B24w0jPaTa81zjj5Rrx5xU%2BNCY%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'neennein',
    },
    {
      name: 'Garfield',
      niche: 'The Passport',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/b63b1d3ab6b5e7322f7d0a68795c3087~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=c7b08aaa&x-expires=1774411200&x-signature=sSEiqb6W8YIHYRmzpFSCU6ni%2FwA%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'jeerabud',
    },
    {
      name: 'Aim',
      niche: 'The Passport',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://scontent.fbkk12-3.fna.fbcdn.net/v/t39.30808-6/595160835_10236184924816369_948867914942126156_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=Y1kIBeylv60Q7kNvwEvoVv5&_nc_oc=Adq0hHyjHtMyHGyeGxPCZ1PpPYONF3H_vqnUpi1zQ-NsKgNE5LBSZH3BBtuwteMSU0nLy3yZIrjVUF7EqwhKllOz&_nc_zt=23&_nc_ht=scontent.fbkk12-3.fna&_nc_gid=OSUCXz2mW9435gn7f4Vjzw&_nc_ss=7a32e&oh=00_Afy9UoZn3REbE0KX3BsAbHfy9MYzgAOMC_nYDKay0nDwcg&oe=69C691F1',
      countryCode: 'TH',
      platform: 'Facebook',
      socialHandle: 'aim.sangboon',
    },
    // ── The Global Bridge (คนไทยในต่างประเทศ) ──────────────────────────────────
    {
      name: 'Sunwa',
      niche: 'The Global Bridge',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/6817ff1d7d12d119269f6d6199939662~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=1de6f04f&x-expires=1774411200&x-signature=sceDH0Iy8rCR22Cpm9Z3vWNOfWo%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',

      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'ssunwa29',
    },
    {
      name: 'Earn',
      niche: 'The Global Bridge',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/46f95c422cd7a2e625741ed941ce76a9~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=1ab35669&x-expires=1774411200&x-signature=fNCRf23iHAsAZ1yMxDhD9ZE0bPw%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',

      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'earnshares',
    },
    {
      name: 'Elle',
      niche: 'The Global Bridge',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p77-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/16acb6369e7b2bad03cf7dcb9dc9d742~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=0c0c7d11&x-expires=1774411200&x-signature=3%2BQfU2ZbeRxP%2BiiRB8NUdZeFos4%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',

      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'enuntr',
    },
    {
      name: 'Anna',
      niche: 'The Global Bridge',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/c62e04f887e37e9c3079cebe588acd4f~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=0398c4ea&x-expires=1774411200&x-signature=wz438EFEcfUXv8lmON%2FEqqGWTJk%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',

      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'arnabarbie',
    },
    {
      name: 'Jaew',
      niche: 'The Global Bridge',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p77-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/9f2a9dba819f83b870a8d16958d2a356~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=efb4ab28&x-expires=1774411200&x-signature=bcLqMRRxYuwPF6agmV%2BWJ8fwFpg%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',

      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'iratchaa',
    },
    {
      name: 'Yok',
      niche: 'The Global Bridge',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/55bc24bb178e33d5be6085d9cc79a1b9~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=095c3e23&x-expires=1774411200&x-signature=jK5wyjY952HE30%2ByW5ayA5euJhA%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',

      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'jadeeeeeenn',
    },
    {
      name: 'Benz',
      niche: 'The Global Bridge',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p19-common-sign-useastred.tiktokcdn-eu.com/tos-useast2a-avt-0068-giso/f65fd497e9846ba03c585b3eddbdcb45~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=718be472&x-expires=1774411200&x-signature=wXo76eMwU9Adftm2%2FDXtzVe4DY4%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',

      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'benzspch',
    },
    // ── The Global Bridge (ชาวต่างชาติ) ────────────────────────────────────────
    {
      name: 'Retiring To Asia',
      niche: 'The Global Bridge',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/f416d5cf17bdfeee0ddc016157677ae4~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=d2ebbd99&x-expires=1774411200&x-signature=3lS8evdj7aevUg7YUmVOnMDQdnQ%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',

      countryCode: 'US',
      platform: 'TikTok',
      socialHandle: 'Retiring To Asia',
    },
    {
      name: 'Jennalyn',
      niche: 'The Global Bridge',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://instagram.fbkk8-4.fna.fbcdn.net/v/t51.82787-19/607563515_17924490531199164_8212807994560219707_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fbkk8-4.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2gGA8b7rKFBOJ7Qc3geQ8gV6j05KfWbxhI6e8sx-Li4T1O9_EboxflVj5U8KahKGcWfkc2dBM5QTbzkIJUbMKbNQ&_nc_ohc=jLNO-tV1NdkQ7kNvwGI3rZ0&_nc_gid=4gdR-e1rpESpIy_rPslHxQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfwK1JD9h7ASdrM6TfA1JXaDpyaCdc_RKHKf15U5InPpJw&oe=69C692D9&_nc_sid=7a9f4b',
      countryCode: 'AU',
      platform: 'Instagram',
      socialHandle: 'jennalyncreative',
    },
    // ── The World Dominator (คนไทยในต่างประเทศ) ─────────────────────────────────
    {
      name: 'Alice',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/7334331971600515077~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=792a485d&x-expires=1774411200&x-signature=gOMB5GGOj5SKMgbEm7f1kSFIAD8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'alice_chayada',
    },
    {
      name: 'Rebecca',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p77-sign-va.tiktokcdn.com/tos-maliva-avt-0068/54ccd3fd08bb2e07aac3bc5a3c76f3c8~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=2ebec423&x-expires=1774414800&x-signature=hRM3j%2B8LX7Aw%2BHKPLUYK9olpRxA%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: '_rebecca_int',
    },
    {
      name: 'Ao',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/3170501d5e6594e6abbc6d8577f7bb4d~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=8de8b0ee&x-expires=1774414800&x-signature=Hwkr4WA4tMBpclWTVPZFpwnAOrI%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'patchainparis',
    },
    {
      name: 'Koii',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://scontent.fbkk12-1.fna.fbcdn.net/v/t39.30808-6/495392266_9995935103802166_4790205755120876966_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=Hx_At_B0PU4Q7kNvwGg6HOS&_nc_oc=AdquHR_EVPOuE7zLx547w1IfOwS9kzGiGi24zp4vvc3akPPO2vDc4bLma4XbMGV1j8GXBNK3BnaICkun1T5Mx_5F&_nc_zt=23&_nc_ht=scontent.fbkk12-1.fna&_nc_gid=T0NapKwsQEOKAlc5DPcmCg&_nc_ss=7a32e&oh=00_Afz3bmGIbkSiqS0de2c9mrwXiqCrDvVT1n82GdbAmkNWVg&oe=69C6AA91',
      countryCode: 'TH',
      platform: 'Facebook',
      socialHandle: 'Ssura Koii',
    },
    {
      name: 'Parjant',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://scontent.fbkk12-5.fna.fbcdn.net/v/t39.30808-6/455326322_26803074512624465_8434143484354838778_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=RFVNOG8WNfoQ7kNvwEuNafs&_nc_oc=AdoQn-HP4XkCxx0Orio7Fw2eMorcQIHjwbl26Tew50ZT5bnlntWXfF-UEHutZYa1IgCq5z0QWP8gXu_ShY5wjHop&_nc_zt=23&_nc_ht=scontent.fbkk12-5.fna&_nc_gid=f1dqn1bg7qjdvmL2IzBunQ&_nc_ss=7a32e&oh=00_Afwndu2ErYQnVeA58mwigKyPrM_NR1nMoKp5Ti2w99nlqA&oe=69C693A3',
      countryCode: 'TH',
      platform: 'Facebook',
      socialHandle: 'Parjant Jantakan H',
    },
    {
      name: 'Sua',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/fdd7a27728143c81432c001c67833307~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=b3ece50d&x-expires=1774418400&x-signature=%2F%2F4DeqrTODCMYnb5ZGmUdBOhccw%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'babysuaaa',
    },
    {
      name: 'Newz',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/25e6c28d9509d2e9ea52ab229defda6c~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=65258935&x-expires=1774418400&x-signature=jgd%2BgjPhvGrugjkDkcL13CjvO6c%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'newsvilliz',
    },
    {
      name: 'Amm',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://scontent.fbkk9-3.fna.fbcdn.net/v/t39.30808-6/527127428_25003865302533721_149994659228979575_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=DABiEwMgag8Q7kNvwEfCanp&_nc_oc=AdoYBegZC1H5VTgZO3L1RVoedbbn9-JSQ2y0eC_XAHCakspvC7_oBHhMQp1cNsJaq3QfmyGJ_smbZqr6uyMAmL61&_nc_zt=23&_nc_ht=scontent.fbkk9-3.fna&_nc_gid=XalLtCD6nHUOUPovBqfelg&_nc_ss=7a32e&oh=00_AfwCjaxUQIL9bh7M1Xi64MQE8iwupQRvCij1zPeDG7w_lA&oe=69C6A2F7',
      countryCode: 'TH',
      platform: 'Facebook',
      socialHandle: 'amm.mimi',
    },
    {
      name: 'Whay',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/5e2949d3619f30d7620623e5f762a396~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=6d20345e&x-expires=1774418400&x-signature=9X7V%2FLNvr%2BI40Twefi0UaoHuKl8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'tonwhay2538',
    },
    // ── The World Dominator (ชาวต่างชาติ) ──────────────────────────────────────
    {
      name: 'Delila',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p19-common-sign-useastred.tiktokcdn-eu.com/tos-useast2a-avt-0068-euttp/a0626ed7fdafaba618d16d2f2d2f55d0~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=2027596c&x-expires=1774418400&x-signature=TR9MEWuuhuSwa1eBzcuX4qZeh8g%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryCode: 'RO',
      platform: 'TikTok',
      socialHandle: 'delillahp',
      portfolioUrl:
        'https://www.canva.com/design/DAF_NAh4zz4/q1ags8uYvOF5dzop6QXXfw/view',
    },
    {
      name: 'Sonal Rana',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://instagram.fbkk12-2.fna.fbcdn.net/v/t51.2885-19/466788640_2647099292143396_6937753046888643651_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmV4cGVyaW1lbnRhbCJ9&_nc_ht=instagram.fbkk12-2.fna.fbcdn.net&_nc_cat=104&_nc_oc=Q6cZ2gH8dOfXLOckmutmbeVlH5Kz-N5xXmvlU7eL4N1Q9TdbIQQ9_-Jr-fV9JYG6m7FO8099BzXD99N3jl5zqXmhB6yj&_nc_ohc=oI2lJbfmvfMQ7kNvwFKwj6S&_nc_gid=BM_DN1jZUwsNgRak3HcF6w&edm=ALGbJPMBAAAA&ccb=7-5&oh=00_AfwtncspX1IxaEgTPAj0negkSibDDCjOStwZjV2x1r5MeQ&oe=69C69C7D&_nc_sid=7d3ac5',
      countryCode: 'US',
      platform: 'Instagram',
      socialHandle: 'iamsonalrana',
      portfolioUrl: 'https://sonalrana.my.canva.site/portfolio',
    },
    {
      name: 'Katelynn',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/ebdb255d40811e361ca08bf8b33f72b0~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=46b41684&x-expires=1774418400&x-signature=ssVqr9lzd%2Fzi8SN2aWaxplkbvME%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryCode: 'CA',
      platform: 'TikTok',
      socialHandle: 'ugcwithkaytelynn',
      portfolioUrl: 'https://ugcwithkaytelynn.ca/',
    },
    {
      name: 'Senia',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p19-common-sign-useastred.tiktokcdn-eu.com/tos-useast2a-avt-0068-euttp/1d0ecf0bde1b86e6e67ba946aa2f8a1c~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=5c594630&x-expires=1774418400&x-signature=xVfGmkjjvBvLjLYJjMzem77FJh0%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryCode: 'IT',
      platform: 'TikTok',
      socialHandle: 'seniafd',
      portfolioUrl: 'https://fedjunina-ugc.my.canva.site/ugc-creator',
    },
    {
      name: 'Savanna',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/e51b6803b4dab816a622b04a57bf6126~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=5d769b2c&x-expires=1774418400&x-signature=pJ2opmn2pHDxi3nelkYVT3L%2BfCc%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryCode: 'US',
      platform: 'TikTok',
      socialHandle: 'savannalyncreates',
    },
  ];

  // 5 backup creators (ตัวสำรอง)
  const backupCreators: CreatorInput[] = [
    {
      name: 'Zaiah',
      niche: 'The Passport',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/160e6723ddc3e004cf76ae4cc4e7a4e1~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=9f92adf4&x-expires=1774418400&x-signature=NYvgYW9k%2BXEYbm4xyc9iy7Lr0xg%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryCode: 'PH',
      platform: 'TikTok',
      socialHandle: 'cryzaiah',
    },
    {
      name: 'Karina',
      niche: 'The Global Bridge',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://instagram.fbkk12-6.fna.fbcdn.net/v/t51.82787-19/654692456_17869611933580422_3754751868739424236_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fbkk12-6.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2gHb7L6Ifl7nZLpj0jOLB__emgTEKSgAGF7EeFDq0pkBW0kFw0fsPQgy4YZ-r8s38ra89ztFyRMKOjlMDbFhyZBl&_nc_ohc=BLKpTlz0QZ8Q7kNvwGrGyyT&_nc_gid=DMhva-aEMTBfPw7BK6ck5g&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Afxf7DbGY27KMYnSDWgM0vjNB9h_OP9qYWjIZlNewta9Nw&oe=69C6B06D&_nc_sid=7a9f4b',
      countryCode: 'DE',
      platform: 'Instagram',
      socialHandle: 'karinaneufeld.ugc',
    },
    {
      name: 'Lookbas',
      niche: 'The Passport',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/e162965d42e28e5a43ea50f9c101c62d~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=1f16d25d&x-expires=1774418400&x-signature=m51Rsy7wnjHmzQSHpgMwS0zsbPc%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'lookbasinfrance',
    },
    {
      name: 'Nacia',
      niche: 'The Global Bridge',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/983fc490643f93920380d67e55e81f2c~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=e51099ec&x-expires=1774418400&x-signature=ShHcb%2FScDeSRvajHhk%2B1lTqkAXs%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryCode: 'TH',
      platform: 'TikTok',
      socialHandle: 'cianacia',
    },
    {
      name: 'Esther',
      niche: 'The World Dominator',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/e0ff03c7afc8a46eb663dcfb7aa81c92~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=ba863963&x-expires=1774418400&x-signature=ihh0TVDraTwVD1lQ4qSdOzl9zK8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryCode: 'NL',
      platform: 'TikTok',
      socialHandle: 'estherinnl',
    },
  ];

  for (const creator of mainCreators) {
    await prisma.creator.create({
      data: {
        id: `main-${creator.name.toLowerCase().replace(/[\s@]+/g, '-')}`,
        ...creator,
        countryId: codeToCountryId[creator.countryCode] ?? null,
      },
    });
  }

  for (const creator of backupCreators) {
    await prisma.creator.create({
      data: {
        id: `backup-${creator.name.toLowerCase().replace(/[\s@]+/g, '-')}`,
        ...creator,
        countryId: codeToCountryId[creator.countryCode] ?? null,
      },
    });
  }

  console.log('Seeding package creators...');
  await prisma.packageCreator.deleteMany({});

  const nicheToPackageId: Record<string, number> = {
    'The Passport': 1,
    'The Global Bridge': 2,
    'The World Dominator': 3,
  };

  // Main creators — derive packageId from niche
  const sortOrderCounters: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  for (const creator of mainCreators) {
    const packageId = nicheToPackageId[creator.niche];
    if (!packageId) continue;
    const creatorId = `main-${creator.name.toLowerCase().replace(/[\s@]+/g, '-')}`;
    await prisma.packageCreator.create({
      data: {
        packageId,
        creatorId,
        isBackup: false,
        sortOrder: sortOrderCounters[packageId]++,
      },
    });
  }

  // Backup creators — explicit package assignment
  const backupPackageAssignment: Record<string, { packageId: number; sortOrder: number }> = {
    'backup-zaiah':   { packageId: 1, sortOrder: 0 },
    'backup-lookbas': { packageId: 1, sortOrder: 1 },
    'backup-karina':  { packageId: 2, sortOrder: 0 },
    'backup-nacia':   { packageId: 2, sortOrder: 1 },
    'backup-esther':  { packageId: 3, sortOrder: 0 },
  };

  for (const creator of backupCreators) {
    const creatorId = `backup-${creator.name.toLowerCase().replace(/[\s@]+/g, '-')}`;
    const assignment = backupPackageAssignment[creatorId];
    if (!assignment) continue;
    await prisma.packageCreator.create({
      data: {
        creatorId,
        packageId: assignment.packageId,
        isBackup: true,
        sortOrder: assignment.sortOrder,
      },
    });
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  console.log('Seeding categories...');

  await prisma.category.deleteMany();
  await prisma.category.createMany({
    data: [
      { name: 'Food & Snack', type: 'product' },
      { name: 'Beauty & Skincare', type: 'product' },
      { name: 'Health & Wellness', type: 'product' },
      { name: 'Fashion', type: 'product' },
      { name: 'Lifestyle', type: 'product' },
      { name: 'Beverage', type: 'product' },
      { name: 'Electronics', type: 'product' },
      { name: 'Home & Living', type: 'product' },
      { name: 'ร้านอาหาร / คาเฟ่', type: 'service' },
      { name: 'ท่องเที่ยว / โรงแรม', type: 'service' },
      { name: 'ความงาม / สปา', type: 'service' },
      { name: 'ฟิตเนส / สุขภาพ', type: 'service' },
      { name: 'การศึกษา / คอร์สเรียน', type: 'service' },
      { name: 'แอปพลิเคชัน / Software', type: 'service' },
      { name: 'อสังหาริมทรัพย์', type: 'service' },
      { name: 'บริการอื่นๆ', type: 'service' },
    ],
  });

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

    // Clean up dev campaigns so re-seeding always reflects fresh state
    await prisma.campaign.deleteMany({ where: { userId: devUser.id } });

    // Deadlines relative to seed time so they're always in the future
    const deadlineC2 = futureDate(34);
    const deadlineC3 = futureDate(24);
    const deadlineC4 = futureDate(-7); // 7 days overdue — demos เกินกำหนด state
    const deadlineC5 = futureDate(30);
    const deadlineC7 = futureDate(35);

    // Campaign 1: PENDING — Vietnam, PRODUCT
    // Payment confirmed, waiting for brand to create brief
    const c1 = await prisma.campaign.create({
      data: {
        id: 'dev-campaign-1',
        userId: devUser.id,
        countryId: 2, // Vietnam
        packageId: 2, // Global Bridge (10 creators)
        promotionType: 'PRODUCT',
        status: 'PENDING',
      },
    });
    await prisma.campaignProduct.create({
      data: {
        campaignId: c1.id,
        brandName: 'KOLLAB Global',
        productName: 'มะม่วงอบแห้ง Premium',
        category: 'Food & Snack',
        description: 'มะม่วงอบแห้งคัดพิเศษจากเชียงราย รสชาติหวานอมเปรี้ยว ไม่มีสารกันบูด',
        sellingPoints: 'ออร์แกนิค 100% | ไม่มีน้ำตาลเพิ่ม | บรรจุถุงซิปล็อก | ส่งตรงจากสวน',
        isService: false,
        url: 'https://kollabglobal.com/dried-mango',
      },
    });

    // Campaign 2: ACCEPTING — Thailand, SERVICE
    // Brief submitted, accepting creator applications
    const c2 = await prisma.campaign.create({
      data: {
        id: 'dev-campaign-2',
        userId: devUser.id,
        countryId: 1, // Thailand
        packageId: 2, // Global Bridge (10 creators)
        promotionType: 'SERVICE',
        status: 'ACCEPTING',
      },
    });
    await prisma.campaignProduct.create({
      data: {
        campaignId: c2.id,
        brandName: 'TH Brand',
        productName: 'บริการสปาพรีเมียม',
        category: 'ความงาม / สปา',
        description: 'บริการสปาระดับ 5 ดาว ใจกลางกรุงเทพฯ นวดผ่อนคลายและทรีตเมนต์บำรุงผิว',
        sellingPoints: 'นวดโดยผู้เชี่ยวชาญ | สมุนไพรไทยแท้ | ฟรีอาหารว่างออร์แกนิค | จองได้ 24 ชม.',
        isService: true,
        url: 'https://thbrand.com/spa',
      },
    });
    await prisma.campaignBrief.create({
      data: {
        campaignId: c2.id,
        content: JSON.stringify({
          name: 'TH Brand Spa Campaign',
          keys: 'Premium spa, herbal treatments, luxury relaxation',
          dos: 'Show the premium spa atmosphere and herbal treatment process',
          deliverables: '• 1 TikTok video (60 sec) — spa experience showcase\n• 3 Instagram Stories — behind-the-scenes',
          disclosure: '#ad #sponsored #KOLLABGlobal #THBrandSpa',
          deadline: deadlineC2,
        }),
        contentTh: JSON.stringify({
          name: 'แคมเปญสปา TH Brand',
          keys: 'สปาระดับพรีเมียม บำบัดด้วยสมุนไพร ผ่อนคลายหรูหรา',
          dos: 'แสดงบรรยากาศสปาระดับพรีเมียมและขั้นตอนการบำบัดด้วยสมุนไพร',
          deliverables: '• 1 วิดีโอ TikTok (60 วินาที) — โชว์ประสบการณ์สปา\n• 3 Instagram Stories — เบื้องหลัง',
          disclosure: '#ad #sponsored #KOLLABGlobal #THBrandSpa',
          deadline: deadlineC2,
        }),
        publishedAt: new Date(),
      },
    });
    for (const creator of mainCreators.slice(0, 10)) {
      const creatorId = `main-${creator.name.toLowerCase().replace(/[\s@]+/g, '-')}`;
      await prisma.campaignCreator.create({
        data: { campaignId: c2.id, creatorId, status: 'PENDING' },
      });
    }

    // Campaign 3: AWAITING_SHIPMENT — Malaysia, PRODUCT
    // Creators accepted, brand needs to ship product samples
    const c3 = await prisma.campaign.create({
      data: {
        id: 'dev-campaign-3',
        userId: devUser.id,
        countryId: 3, // Malaysia
        packageId: 1, // Passport (5 creators)
        promotionType: 'PRODUCT',
        status: 'AWAITING_SHIPMENT',
      },
    });
    await prisma.campaignProduct.create({
      data: {
        campaignId: c3.id,
        brandName: 'Glow Labs',
        productName: 'Vitamin C Serum',
        category: 'Beauty & Skincare',
        description: 'วิตามิน C เซรั่มเข้มข้น 20% ลดเลือนจุดด่างดำ กระจ่างใส ใน 2 สัปดาห์',
        sellingPoints: 'Vitamin C 20% | Hyaluronic Acid | ทดสอบโดยผิวแพ้ง่าย | Cruelty-Free',
        isService: false,
        url: 'https://glowlabs.com/vitamin-c',
      },
    });
    await prisma.campaignBrief.create({
      data: {
        campaignId: c3.id,
        content: JSON.stringify({
          name: 'Glow Labs Vitamin C Serum Campaign',
          keys: 'Vitamin C 20%, brightening, before/after, skin texture',
          dos: 'Create authentic before/after content showing the serum routine over 2 weeks',
          deliverables: '• 1 TikTok video — before/after skin transformation\n• 2 Instagram Reels — daily routine',
          disclosure: '#ad #sponsored #KOLLABGlobal #GlowLabs',
          deadline: deadlineC3,
        }),
        contentTh: JSON.stringify({
          name: 'แคมเปญ Glow Labs Vitamin C Serum',
          keys: 'วิตามิน C 20% กระจ่างใส before/after ผิวพรรณดีขึ้น',
          dos: 'สร้างคอนเทนต์ before/after แสดงขั้นตอนการใช้เซรั่มเป็นเวลา 2 สัปดาห์',
          deliverables: '• 1 วิดีโอ TikTok — การเปลี่ยนแปลงของผิว before/after\n• 2 Instagram Reels — ขั้นตอนประจำวัน',
          disclosure: '#ad #sponsored #KOLLABGlobal #GlowLabs',
          deadline: deadlineC3,
        }),
        publishedAt: new Date(),
      },
    });
    for (const creator of mainCreators.slice(10, 15)) {
      const creatorId = `main-${creator.name.toLowerCase().replace(/[\s@]+/g, '-')}`;
      await prisma.campaignCreator.create({
        data: { campaignId: c3.id, creatorId, status: 'ACCEPTED' },
      });
    }

    // Campaign 4: ACTIVE — Japan, PRODUCT
    // Product shipped, creators are producing content
    const c4 = await prisma.campaign.create({
      data: {
        id: 'dev-campaign-4',
        userId: devUser.id,
        countryId: 5, // Japan
        packageId: 1, // Passport (5 creators)
        promotionType: 'PRODUCT',
        status: 'ACTIVE',
      },
    });
    await prisma.campaignProduct.create({
      data: {
        campaignId: c4.id,
        brandName: 'SnackBox TH',
        productName: 'ทุเรียนกรอบ Premium',
        category: 'Food & Snack',
        description: 'ทุเรียนกรอบ premium อบด้วยเทคโนโลยี freeze-dry รักษาคุณค่าทางโภชนาการ',
        sellingPoints: 'ทุเรียนพันธุ์หมอนทอง | ไม่มีน้ำมันทอด | กรอบทุกชิ้น | บรรจุพร้อมส่งต่างประเทศ',
        isService: false,
        url: 'https://snackboxth.com/durian',
      },
    });
    await prisma.campaignBrief.create({
      data: {
        campaignId: c4.id,
        content: JSON.stringify({
          name: 'SnackBox TH Durian Crisps Campaign',
          keys: 'Durian crisps, Thai snack, reaction video, first-time experience',
          dos: 'Create reaction/taste test video showing crispy texture and authentic Thai durian flavor',
          deliverables: '• 1 TikTok video — first-time durian taste test\n• 2 Instagram Stories — unboxing and taste',
          disclosure: '#ad #sponsored #KOLLABGlobal #SnackBoxTH',
          deadline: deadlineC4,
        }),
        contentTh: JSON.stringify({
          name: 'แคมเปญ SnackBox TH ทุเรียนกรอบ',
          keys: 'ทุเรียนกรอบ ขนมไทย วิดีโอทดลองชิม ประสบการณ์ครั้งแรก',
          dos: 'สร้างวิดีโอทดลองชิมทุเรียนกรอบ แสดงเนื้อสัมผัสกรอบและรสชาติทุเรียนไทยแท้',
          deliverables: '• 1 วิดีโอ TikTok — ทดลองชิมทุเรียนครั้งแรก\n• 2 Instagram Stories — แกะกล่องและรีวิวรสชาติ',
          disclosure: '#ad #sponsored #KOLLABGlobal #SnackBoxTH',
          deadline: deadlineC4,
        }),
        publishedAt: new Date(),
      },
    });
    for (const creator of mainCreators.slice(15, 20)) {
      const creatorId = `main-${creator.name.toLowerCase().replace(/[\s@]+/g, '-')}`;
      await prisma.campaignCreator.create({
        data: { campaignId: c4.id, creatorId, status: 'ACCEPTED' },
      });
    }

    // Campaign 5: COMPLETED (Live) — Vietnam, PRODUCT
    // Campaign complete, all creators have posted
    const c5 = await prisma.campaign.create({
      data: {
        id: 'dev-campaign-5',
        userId: devUser.id,
        countryId: 2, // Vietnam
        packageId: 1, // Passport (5 creators)
        promotionType: 'PRODUCT',
        status: 'COMPLETED',
        liveAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
    });
    await prisma.campaignProduct.create({
      data: {
        campaignId: c5.id,
        brandName: 'BambooTea',
        productName: 'ชาเขียวออร์แกนิค',
        category: 'Beverage',
        description: 'ชาเขียวออร์แกนิคจากไร่ที่ได้รับการรับรอง ชงง่าย รสชาติสด',
        sellingPoints: 'Organic certified | Zero sugar | 30 sachets | Ship worldwide',
        isService: false,
        url: 'https://bambootea.com/green',
      },
    });
    await prisma.campaignBrief.create({
      data: {
        campaignId: c5.id,
        content: JSON.stringify({
          name: 'BambooTea Green Tea Campaign',
          keys: 'Organic green tea, morning routine, zero-sugar, calming ritual',
          dos: 'Create a morning routine video featuring the tea. Show the calming ritual and highlight zero-sugar, organic certification.',
          deliverables: '• 1 TikTok video — morning routine with tea\n• 2 Instagram Stories — organic lifestyle',
          disclosure: '#ad #sponsored #KOLLABGlobal #BambooTea',
          deadline: deadlineC5,
        }),
        contentTh: JSON.stringify({
          name: 'แคมเปญ BambooTea ชาเขียวออร์แกนิค',
          keys: 'ชาเขียวออร์แกนิค morning routine zero-sugar ผ่อนคลาย',
          dos: 'สร้างวิดีโอ morning routine ที่มีชาเขียวออร์แกนิค แสดงช่วงเวลาผ่อนคลายและเน้น zero-sugar และใบรับรองออร์แกนิค',
          deliverables: '• 1 วิดีโอ TikTok — morning routine กับชาเขียว\n• 2 Instagram Stories — ไลฟ์สไตล์ออร์แกนิค',
          disclosure: '#ad #sponsored #KOLLABGlobal #BambooTea',
          deadline: deadlineC5,
        }),
        publishedAt: new Date(),
      },
    });
    for (const creator of mainCreators.slice(20, 25)) {
      const creatorId = `main-${creator.name.toLowerCase().replace(/[\s@]+/g, '-')}`;
      await prisma.campaignCreator.create({
        data: { campaignId: c5.id, creatorId, status: 'COMPLETED' },
      });
    }

    // Campaign 6: AWAITING_PAYMENT — Thailand, PRODUCT
    // All steps complete, waiting for payment confirmation from Omise
    const c6 = await prisma.campaign.create({
      data: {
        id: 'dev-campaign-6',
        userId: devUser.id,
        countryId: 1, // Thailand
        packageId: 1, // Passport (5 creators)
        promotionType: 'PRODUCT',
        status: 'AWAITING_PAYMENT',
      },
    });
    await prisma.campaignProduct.create({
      data: {
        campaignId: c6.id,
        brandName: 'NatureCare',
        productName: 'คอลลาเจนไตรเปปไทด์',
        category: 'Health & Wellness',
        description: 'คอลลาเจน Tripeptide ดูดซึมเร็ว 100% เสริมสร้างผิวเนียนนุ่ม ลดริ้วรอย',
        sellingPoints: 'Tripeptide 5000mg | Vitamin C เสริม | ไม่มีน้ำตาล | รสสตรอเบอร์รี่',
        isService: false,
        url: 'https://naturecare.th/collagen',
      },
    });

    // Campaign 7: ACCEPTING — Thailand, SERVICE, all creators ACCEPTED
    // All creators have accepted — brand can proceed to active
    const c7 = await prisma.campaign.create({
      data: {
        id: 'dev-campaign-7',
        userId: devUser.id,
        countryId: 1, // Thailand
        packageId: 1, // Passport (5 creators)
        promotionType: 'SERVICE',
        status: 'ACCEPTING',
      },
    });
    await prisma.campaignProduct.create({
      data: {
        campaignId: c7.id,
        brandName: 'Urban Fit',
        productName: 'Personal Training Online',
        category: 'ฟิตเนส / สุขภาพ',
        description: 'บริการโค้ชออกกำลังกายส่วนตัวออนไลน์ โปรแกรมเฉพาะบุคคล ดูแลโดยเทรนเนอร์มืออาชีพ',
        sellingPoints: 'โปรแกรมเฉพาะบุคคล | เทรนเนอร์ certified | ติดตามผลรายสัปดาห์ | ไม่ต้องออกจากบ้าน',
        isService: true,
        url: 'https://urbanfit.th/online',
      },
    });
    await prisma.campaignBrief.create({
      data: {
        campaignId: c7.id,
        content: JSON.stringify({
          name: 'Urban Fit x Online Training',
          keys: 'เน้นความสะดวกสบายในการออกกำลังกายที่บ้าน — ผลลัพธ์จริง โค้ชมืออาชีพ เหมาะกับทุกไลฟ์สไตล์',
          dos: 'DO: แสดงประสบการณ์จริงของคุณกับโปรแกรม\nDO: โชว์ผลลัพธ์ที่เห็นได้ชัด เช่น ความฟิต น้ำหนัก ความมั่นใจ\n\nDON\'T: เปรียบเทียบกับโปรแกรมอื่นโดยตรง\nDON\'T: อ้างผลลัพธ์เกินจริงหรือสัญญาผลลัพธ์ที่ไม่สมจริง',
          deliverables: '• 1 วิดีโอ TikTok (30-60 วินาที) — รีวิวประสบการณ์การเทรน โชว์ท่าออกกำลังกาย\n• 3 Instagram Stories — เบื้องหลังการเทรน พร้อม Swipe-up link\n• 1 Instagram Reel — Transformation หรือ Day-in-life กับโปรแกรม',
          disclosure: '#ad #sponsored #KOLLABGlobal #UrbanFit',
          deadline: deadlineC7,
        }),
        publishedAt: new Date(),
      },
    });
    for (const creator of mainCreators.slice(0, 5)) {
      const creatorId = `main-${creator.name.toLowerCase().replace(/[\s@]+/g, '-')}`;
      await prisma.campaignCreator.create({
        data: { campaignId: c7.id, creatorId, status: 'ACCEPTED' },
      });
    }

    console.log(`  - dev-campaign-1: PENDING (Vietnam, รอสร้าง brief)`);
    console.log(`  - dev-campaign-2: ACCEPTING (Thailand service, 10 creators, PENDING)`);
    console.log(`  - dev-campaign-3: AWAITING_SHIPMENT (Malaysia, 5 creators)`);
    console.log(`  - dev-campaign-4: ACTIVE (Japan, 5 creators)`);
    console.log(`  - dev-campaign-5: COMPLETED/Live (Vietnam, 5 creators)`);
    console.log(`  - dev-campaign-6: AWAITING_PAYMENT (Thailand, รอชำระเงิน)`);
    console.log(`  - dev-campaign-7: ACCEPTING (Thailand service, 5 creators ALL ACCEPTED)`);
  }

  console.log('Seed complete!');
  console.log('  - 11 countries (8 active, 3 inactive)');
  console.log('  - 3 packages');
  console.log('  - 33 creators (28 main, 5 backup)');
  console.log('  - 7 dev campaigns covering all UX statuses (PENDING → ACCEPTING → AWAITING_SHIPMENT → ACTIVE → COMPLETED + AWAITING_PAYMENT + ACCEPTING-all-accepted-service)');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
