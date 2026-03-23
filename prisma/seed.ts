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
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
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
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
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
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
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
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
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
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
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
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
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
    where: { id: 7 },
    update: {},
    create: {
      id: 7,
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
    where: { id: 8 },
    update: {},
    create: {
      id: 8,
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
    where: { id: 9 },
    update: {},
    create: {
      id: 9,
      name: 'CLMV Region',
      flag: '🌏',
      creatorsAvail: 0,
      platforms: [],
      cats: [],
      isActive: false,
    },
  });

  await prisma.country.upsert({
    where: { id: 10 },
    update: {},
    create: {
      id: 10,
      name: 'Australia',
      flag: '🇦🇺',
      creatorsAvail: 0,
      platforms: [],
      cats: [],
      isActive: false,
    },
  });

  await prisma.country.upsert({
    where: { id: 11 },
    update: {},
    create: {
      id: 11,
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
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
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
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
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
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
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

  // Clear existing creators (cascade-safe: CampaignCreator references are dev-only)
  await prisma.campaignCreator.deleteMany({});
  await prisma.creator.deleteMany({});

  type CreatorInput = {
    name: string;
    niche: string;
    engagement: string;
    reach: string;
    avatar: string;
    countryFlag: string;
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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

      countryFlag: '🇹🇭',
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

      countryFlag: '🇹🇭',
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

      countryFlag: '🇹🇭',
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

      countryFlag: '🇹🇭',
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

      countryFlag: '🇹🇭',
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

      countryFlag: '🇹🇭',
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

      countryFlag: '🇹🇭',
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

      countryFlag: '🇺🇸',
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
      countryFlag: '🇦🇺',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇹🇭',
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
      countryFlag: '🇷🇴',
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
      countryFlag: '🇺🇸',
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
      countryFlag: '🇨🇦',
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
      countryFlag: '🇮🇹',
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
      countryFlag: '🇺🇸',
      platform: 'TikTok',
      socialHandle: 'savannalyncreates',
    },
  ];

  // 5 backup creators (ตัวสำรอง)
  const backupCreators: CreatorInput[] = [
    {
      name: 'Zaiah',
      niche: 'ตัวสำรอง',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/160e6723ddc3e004cf76ae4cc4e7a4e1~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=9f92adf4&x-expires=1774418400&x-signature=NYvgYW9k%2BXEYbm4xyc9iy7Lr0xg%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryFlag: '🇵🇭',
      platform: 'TikTok',
      socialHandle: 'cryzaiah',
    },
    {
      name: 'Karina',
      niche: 'ตัวสำรอง',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://instagram.fbkk12-6.fna.fbcdn.net/v/t51.82787-19/654692456_17869611933580422_3754751868739424236_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fbkk12-6.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2gHb7L6Ifl7nZLpj0jOLB__emgTEKSgAGF7EeFDq0pkBW0kFw0fsPQgy4YZ-r8s38ra89ztFyRMKOjlMDbFhyZBl&_nc_ohc=BLKpTlz0QZ8Q7kNvwGrGyyT&_nc_gid=DMhva-aEMTBfPw7BK6ck5g&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Afxf7DbGY27KMYnSDWgM0vjNB9h_OP9qYWjIZlNewta9Nw&oe=69C6B06D&_nc_sid=7a9f4b',
      countryFlag: '🇩🇪',
      platform: 'Instagram',
      socialHandle: 'karinaneufeld.ugc',
    },
    {
      name: 'Lookbas',
      niche: 'ตัวสำรอง',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/e162965d42e28e5a43ea50f9c101c62d~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=1f16d25d&x-expires=1774418400&x-signature=m51Rsy7wnjHmzQSHpgMwS0zsbPc%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryFlag: '🇹🇭',
      platform: 'TikTok',
      socialHandle: 'lookbasinfrance',
    },
    {
      name: 'Nacia',
      niche: 'ตัวสำรอง',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/983fc490643f93920380d67e55e81f2c~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=e51099ec&x-expires=1774418400&x-signature=ShHcb%2FScDeSRvajHhk%2B1lTqkAXs%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryFlag: '🇹🇭',
      platform: 'TikTok',
      socialHandle: 'cianacia',
    },
    {
      name: 'Esther',
      niche: 'ตัวสำรอง',
      engagement: 'N/A',
      reach: 'N/A',
      avatar:
        'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/e0ff03c7afc8a46eb663dcfb7aa81c92~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=ba863963&x-expires=1774418400&x-signature=ihh0TVDraTwVD1lQ4qSdOzl9zK8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
      countryFlag: '🇳🇱',
      platform: 'TikTok',
      socialHandle: 'estherinnl',
    },
  ];

  for (const creator of mainCreators) {
    await prisma.creator.create({
      data: {
        id: `main-${creator.name.toLowerCase().replace(/[\s@]+/g, '-')}`,
        ...creator,
        isBackup: false,
      },
    });
  }

  for (const creator of backupCreators) {
    await prisma.creator.create({
      data: {
        id: `backup-${creator.name.toLowerCase().replace(/[\s@]+/g, '-')}`,
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
        countryId: 2,
        packageId: 2,
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
        description:
          'มะม่วงอบแห้งคัดพิเศษจากเชียงราย รสชาติหวานอมเปรี้ยว ไม่มีสารกันบูด',
        sellingPoints:
          'ออร์แกนิค 100% | ไม่มีน้ำตาลเพิ่ม | บรรจุถุงซิปล็อก | ส่งตรงจากสวน',
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
  console.log('  - 33 creators (28 main, 5 backup)');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
