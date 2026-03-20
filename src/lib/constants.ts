export const CREATOR_LANG_BY_COUNTRY: Record<
  string,
  { code: string; name: string; flag: string }
> = {
  thailand: { code: "th", name: "Thai", flag: "🇹🇭" },
  vietnam: { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  malaysia: { code: "ms", name: "Malay", flag: "🇲🇾" },
  laos: { code: "lo", name: "Lao", flag: "🇱🇦" },
  japan: { code: "ja", name: "Japanese", flag: "🇯🇵" },
  korea: { code: "ko", name: "Korean", flag: "🇰🇷" },
  usa: { code: "en", name: "English", flag: "🇺🇸" },
  uk: { code: "en", name: "English", flag: "🇬🇧" },
  australia: { code: "en", name: "English", flag: "🇦🇺" },
  eu: { code: "en", name: "English", flag: "🇪🇺" },
  clmv: { code: "en", name: "English", flag: "🌏" },
};

export const ASIA_COUNTRY_IDS = new Set([
  "thailand",
  "vietnam",
  "malaysia",
  "laos",
  "japan",
  "korea",
]);

export interface PackageExtra {
  platforms: string[];
  deliverables: string[];
}

export const PACKAGE_EXTRAS: Record<string, PackageExtra> = {
  starter: {
    platforms: ["tiktok"],
    deliverables: ["TikTok 1 วิดีโอ (15–60 วิ)"],
  },
  popular: {
    platforms: ["tiktok", "instagram"],
    deliverables: ["TikTok 1 วิดีโอ (15–60 วิ)", "IG 1 Reel + 3 Stories"],
  },
  value: {
    platforms: ["tiktok", "instagram", "facebook"],
    deliverables: [
      "TikTok 1 วิดีโอ (15–60 วิ)",
      "IG 1 Reel + 3 Stories",
      "Facebook 2 โพสต์",
    ],
  },
};

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
