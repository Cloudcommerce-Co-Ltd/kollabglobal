import type { Country } from "@/types";

export const mockCountry: Country = {
  id: 1,
  name: "Thailand",
  countryCode: "TH",
  region: "asia",
  languageCode: "th",
  languageName: "Thai",
  creatorsAvail: 1500,
  avgEyeball: "120K",
  avgCPE: "2.5%",
  foodBevEng: "4.2%",
  beautyEng: "3.8%",
  snackTrend: "high",
  estReach: null,
  estOrders: null,
  isActive: true,
  platforms: ["TikTok", "Instagram"],
  cats: ["Food & Beverage", "Beauty"],
};

export function makeMockCountry(overrides: Partial<Country> = {}): Country {
  return { ...mockCountry, ...overrides };
}
