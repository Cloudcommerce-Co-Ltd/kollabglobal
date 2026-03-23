export const CREATOR_LANG_BY_COUNTRY: Record<
  number,
  { code: string; name: string; flag: string }
> = {
  1: { code: "th", name: "Thai", flag: "🇹🇭" },       // Thailand
  2: { code: "vi", name: "Vietnamese", flag: "🇻🇳" },  // Vietnam
  3: { code: "ms", name: "Malay", flag: "🇲🇾" },       // Malaysia
  4: { code: "lo", name: "Lao", flag: "🇱🇦" },         // Laos
  5: { code: "ja", name: "Japanese", flag: "🇯🇵" },    // Japan
  6: { code: "ko", name: "Korean", flag: "🇰🇷" },      // South Korea
  7: { code: "en", name: "English", flag: "🇺🇸" },     // United States
  8: { code: "en", name: "English", flag: "🇬🇧" },     // United Kingdom
  10: { code: "en", name: "English", flag: "🇦🇺" },    // Australia
  11: { code: "en", name: "English", flag: "🇪🇺" },    // EU Region
  9: { code: "en", name: "English", flag: "🌏" },      // CLMV Region
};

// IDs 1–6 are Asia countries per seed data
export const ASIA_COUNTRY_IDS = new Set([1, 2, 3, 4, 5, 6]);

export interface PackageExtra {
  platforms: string[];
  deliverables: string[];
}

export const PACKAGE_EXTRAS: Record<number, PackageExtra> = {
  1: {  // Starter
    platforms: ["tiktok"],
    deliverables: ["TikTok 1 วิดีโอ (15–60 วิ)"],
  },
  2: {  // Popular
    platforms: ["tiktok", "instagram"],
    deliverables: ["TikTok 1 วิดีโอ (15–60 วิ)", "IG 1 Reel + 3 Stories"],
  },
  3: {  // Value
    platforms: ["tiktok", "instagram", "facebook"],
    deliverables: [
      "TikTok 1 วิดีโอ (15–60 วิ)",
      "IG 1 Reel + 3 Stories",
      "Facebook 2 โพสต์",
    ],
  },
};

/** Filters countries by region tab. */
export function filterCountriesByRegion<T extends { id: number }>(
  countries: T[],
  region: "asia" | "global"
): T[] {
  if (region === "asia") {
    return countries.filter((c) => ASIA_COUNTRY_IDS.has(c.id));
  }
  return countries.filter((c) => !ASIA_COUNTRY_IDS.has(c.id));
}

export const PRODUCT_CATEGORIES = [
  "Food & Snack", "Beauty & Skincare", "Health & Wellness", "Fashion",
  "Lifestyle", "Beverage", "Electronics", "Home & Living",
];

export const SERVICE_CATEGORIES = [
  "ร้านอาหาร / คาเฟ่", "ท่องเที่ยว / โรงแรม", "ความงาม / สปา",
  "ฟิตเนส / สุขภาพ", "การศึกษา / คอร์สเรียน", "แอปพลิเคชัน / Software",
  "อสังหาริมทรัพย์", "บริการอื่นๆ",
];

export const SAMPLE_CREATOR_AVATARS = [
  { avatar: "👩🏻", name: "Linh Tran", niche: "Food Review", eng: "8.5%", reach: "250K", flag: "🇻🇳" },
  { avatar: "👩🏽", name: "Salwa Ahmad", niche: "Lifestyle", eng: "7.2%", reach: "180K", flag: "🇲🇾" },
  { avatar: "👨🏻‍🦱", name: "Luca Rossi", niche: "Thai Culture", eng: "9.1%", reach: "320K", flag: "🇮🇹" },
  { avatar: "👩🏻", name: "Mai Nguyen", niche: "Food & Bev", eng: "6.8%", reach: "150K", flag: "🇻🇳" },
  { avatar: "👨🏻", name: "James Park", niche: "Lifestyle", eng: "8.9%", reach: "290K", flag: "🇺🇸" },
  { avatar: "👩🏾", name: "Aisha Karim", niche: "Health", eng: "7.5%", reach: "200K", flag: "🇲🇾" },
  { avatar: "👩🏽‍🦱", name: "Priya Sharma", niche: "Travel & Food", eng: "8.2%", reach: "270K", flag: "🇮🇳" },
  { avatar: "👨🏻‍🦰", name: "David Kim", niche: "Fashion", eng: "7.8%", reach: "230K", flag: "🇰🇷" },
  { avatar: "👩🏿", name: "Nina Williams", niche: "Beauty", eng: "9.3%", reach: "340K", flag: "🇬🇧" },
  { avatar: "👨🏽", name: "Carlos Santos", niche: "Food", eng: "7.9%", reach: "210K", flag: "🇧🇷" },
  { avatar: "👩🏼", name: "Olivia Turner", niche: "Skincare", eng: "6.5%", reach: "140K", flag: "🇦🇺" },
  { avatar: "👨🏾", name: "Ryan Brooks", niche: "Fitness", eng: "7.1%", reach: "190K", flag: "🇺🇸" },
  { avatar: "👩🏻‍🦰", name: "Maya Lee", niche: "Fashion", eng: "8.0%", reach: "220K", flag: "🇰🇷" },
  { avatar: "👨🏻", name: "Kevin Nguyen", niche: "Tech & Life", eng: "6.9%", reach: "165K", flag: "🇻🇳" },
  { avatar: "👩🏽‍🦱", name: "Zara Ahmed", niche: "Beauty", eng: "7.7%", reach: "205K", flag: "🇲🇾" },
];

export const STATIC_CHECKOUT_DATA = {
  packageName: "Popular",
  numCreators: 10,
  numPosts: 20,
  duration: "30 วัน",
  campaignType: "สินค้า",
  basePrice: 33250,
  vatRate: 0.07,
  serviceFeeRate: 0.03,
};
