export const CREATOR_LANG_BY_COUNTRY: Record<
  number,
  { code: string; name: string; flag: string }
> = {
  1: { code: 'th', name: 'Thai', flag: '🇹🇭' }, // Thailand
  2: { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' }, // Vietnam
  3: { code: 'ms', name: 'Malay', flag: '🇲🇾' }, // Malaysia
  4: { code: 'lo', name: 'Lao', flag: '🇱🇦' }, // Laos
  5: { code: 'ja', name: 'Japanese', flag: '🇯🇵' }, // Japan
  6: { code: 'ko', name: 'Korean', flag: '🇰🇷' }, // South Korea
  7: { code: 'en', name: 'English', flag: '🇺🇸' }, // United States
  8: { code: 'en', name: 'English', flag: '🇬🇧' }, // United Kingdom
  10: { code: 'en', name: 'English', flag: '🇦🇺' }, // Australia
  11: { code: 'en', name: 'English', flag: '🇪🇺' }, // EU Region
  9: { code: 'en', name: 'English', flag: '🌏' }, // CLMV Region
};

// IDs 1–6 are Asia countries per seed data
export const ASIA_COUNTRY_IDS = new Set([1, 2, 3, 4, 5, 6]);

export interface PackageExtra {
  platforms: string[];
  deliverables: string[];
}

export const PACKAGE_EXTRAS: Record<number, PackageExtra> = {
  1: {
    // Starter
    platforms: ['tiktok'],
    deliverables: ['TikTok 1 วิดีโอ (15–60 วิ)'],
  },
  2: {
    // Popular
    platforms: ['tiktok', 'instagram'],
    deliverables: ['TikTok 1 วิดีโอ (15–60 วิ)', 'IG 1 Reel + 3 Stories'],
  },
  3: {
    // Value
    platforms: ['tiktok', 'instagram', 'facebook'],
    deliverables: [
      'TikTok 1 วิดีโอ (15–60 วิ)',
      'IG 1 Reel + 3 Stories',
      'Facebook 2 โพสต์',
    ],
  },
};

/** Filters countries by region tab. */
export function filterCountriesByRegion<T extends { id: number }>(
  countries: T[],
  region: 'asia' | 'global',
): T[] {
  if (region === 'asia') {
    return countries.filter(c => ASIA_COUNTRY_IDS.has(c.id));
  }
  return countries.filter(c => !ASIA_COUNTRY_IDS.has(c.id));
}

export const PRODUCT_CATEGORIES = [
  'Food & Snack',
  'Beauty & Skincare',
  'Health & Wellness',
  'Fashion',
  'Lifestyle',
  'Beverage',
  'Electronics',
  'Home & Living',
];

export const SERVICE_CATEGORIES = [
  'ร้านอาหาร / คาเฟ่',
  'ท่องเที่ยว / โรงแรม',
  'ความงาม / สปา',
  'ฟิตเนส / สุขภาพ',
  'การศึกษา / คอร์สเรียน',
  'แอปพลิเคชัน / Software',
  'อสังหาริมทรัพย์',
  'บริการอื่นๆ',
];

export const SAMPLE_CREATOR_AVATARS = [
  // The Passport
  {
    avatar: 'https://www.tiktok.com/@jutamatketkaew',
    name: 'Kelly',
    niche: 'The Passport',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@korbfa',
    name: 'J',
    niche: 'The Passport',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@neennein',
    name: 'Neen',
    niche: 'The Passport',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@jeerabud',
    name: 'Garfield',
    niche: 'The Passport',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.facebook.com/aim.sangboon',
    name: 'Aim',
    niche: 'The Passport',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  // The Global Bridge
  {
    avatar: 'https://www.tiktok.com/@ssunwa29',
    name: 'Sunwa',
    niche: 'The Global Bridge',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@earnshares',
    name: 'Earn',
    niche: 'The Global Bridge',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@enuntr',
    name: 'Elle',
    niche: 'The Global Bridge',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@arnabarbie',
    name: 'Anna',
    niche: 'The Global Bridge',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@iratchaa',
    name: 'Jaew',
    niche: 'The Global Bridge',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@jadeeeeeenn',
    name: 'Yok',
    niche: 'The Global Bridge',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@benzspch',
    name: 'Benz',
    niche: 'The Global Bridge',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@retiringtoasia',
    name: 'Retiring To Asia',
    niche: 'The Global Bridge',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇺🇸',
  },
  {
    avatar: 'https://www.instagram.com/jennalyncreative',
    name: 'Jennalyn',
    niche: 'The Global Bridge',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇦🇺',
  },
  // The World Dominator
  {
    avatar: 'https://www.tiktok.com/@alice_chayada',
    name: 'Alice',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@_rebecca_int',
    name: 'Rebecca',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@patchainparis',
    name: 'Ao',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.facebook.com/Ssura.Koii',
    name: 'Koii',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.facebook.com/Parjant.Jantakan.H',
    name: 'Parjant',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@babysuaaa',
    name: 'Sua',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@newsvilliz',
    name: 'Newz',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.facebook.com/amm.mimi',
    name: 'Amm',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@tonwhay2538',
    name: 'Whay',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@delillahp',
    name: 'Delila',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇷🇴',
  },
  {
    avatar: 'https://www.instagram.com/iamsonalrana',
    name: 'Sonal Rana',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇺🇸',
  },
  {
    avatar: 'https://www.tiktok.com/@ugcwithkaytelynn',
    name: 'Katelynn',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇨🇦',
  },
  {
    avatar: 'https://www.tiktok.com/@seniafd',
    name: 'Senia',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇮🇹',
  },
  {
    avatar: 'https://www.tiktok.com/@savannalyncreates',
    name: 'Savanna',
    niche: 'The World Dominator',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇺🇸',
  },
  // Reserves (ตัวสำรอง)
  {
    avatar: 'https://www.tiktok.com/@cryzaiah',
    name: 'Zaiah',
    niche: 'ตัวสำรอง',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇵🇭',
  },
  {
    avatar: 'https://www.instagram.com/karinaneufeld.ugc',
    name: 'Karina',
    niche: 'ตัวสำรอง',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇩🇪',
  },
  {
    avatar: 'https://www.tiktok.com/@lookbasinfrance',
    name: 'Lookbas',
    niche: 'ตัวสำรอง',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@cianacia',
    name: 'Nacia',
    niche: 'ตัวสำรอง',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇹🇭',
  },
  {
    avatar: 'https://www.tiktok.com/@estherinnl',
    name: 'Esther',
    niche: 'ตัวสำรอง',
    eng: 'N/A',
    reach: 'N/A',
    flag: '🇳🇱',
  },
];

export const STATIC_CHECKOUT_DATA = {
  packageName: 'Popular',
  numCreators: 10,
  numPosts: 20,
  duration: '30 วัน',
  campaignType: 'สินค้า',
  basePrice: 33250,
  vatRate: 0.07,
  serviceFeeRate: 0.03,
};
