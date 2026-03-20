import { describe, it, expect, beforeEach } from "vitest";
import { useCampaignStore } from "@/stores/campaign-store";
import { validateStep } from "@/lib/campaign-steps";
import type { Country, Package, Creator } from "@/types";

const mkCountry = (id: string): Country => ({
  id, name: id, flag: '🏳️', creatorsAvail: 0,
  avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null,
  snackTrend: null, platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
});

const mkPackage = (id: string): Package => ({
  id, name: id, badge: null,
  numCreators: 10, pricePerCreator: 3500, discountPct: 0,
  estReach: null, estEngagement: null,
});

const mkCreator = (id: string): Creator => ({
  id, name: id, niche: 'Food', engagement: '5%',
  reach: '100K', avatar: '👩', countryFlag: '🇹🇭', isBackup: false,
});

const product = {
  brandName: 'Brand', productName: 'Product', category: 'Food',
  description: '', sellingPoints: '', url: '', imageUrl: '', isService: false as const,
};

describe("Campaign creation flow — validateStep", () => {
  beforeEach(() => {
    useCampaignStore.getState().reset();
  });

  it("step 1 is always allowed with empty store", () => {
    const state = useCampaignStore.getState();
    expect(validateStep(1, state)).toEqual({ allowed: true });
  });

  it("step 2 blocked with no countryData, redirects to country", () => {
    const state = useCampaignStore.getState();
    expect(validateStep(2, state)).toEqual({ allowed: false, redirectTo: "/campaigns/new/country" });
  });

  it("step 2 allowed after setCountry", () => {
    useCampaignStore.getState().setCountry(mkCountry("thailand"));
    const state = useCampaignStore.getState();
    expect(validateStep(2, state)).toEqual({ allowed: true });
  });

  it("step 3 blocked when only countryData, redirects to product", () => {
    useCampaignStore.getState().setCountry(mkCountry("thailand"));
    const state = useCampaignStore.getState();
    expect(validateStep(3, state)).toEqual({ allowed: false, redirectTo: "/campaigns/new/product" });
  });

  it("step 3 allowed after country + product", () => {
    useCampaignStore.getState().setCountry(mkCountry("thailand"));
    useCampaignStore.getState().setProduct(product);
    const state = useCampaignStore.getState();
    expect(validateStep(3, state)).toEqual({ allowed: true });
  });

  it("step 4 blocked when packageData missing, redirects to package", () => {
    useCampaignStore.getState().setCountry(mkCountry("thailand"));
    useCampaignStore.getState().setProduct(product);
    const state = useCampaignStore.getState();
    expect(validateStep(4, state)).toEqual({ allowed: false, redirectTo: "/campaigns/new/package" });
  });

  it("step 4 allowed after country + product + package", () => {
    useCampaignStore.getState().setCountry(mkCountry("thailand"));
    useCampaignStore.getState().setProduct(product);
    useCampaignStore.getState().setPackage(mkPackage("popular"));
    const state = useCampaignStore.getState();
    expect(validateStep(4, state)).toEqual({ allowed: true });
  });

  it("step 5 blocked when no creators, redirects to creators", () => {
    useCampaignStore.getState().setCountry(mkCountry("thailand"));
    useCampaignStore.getState().setProduct(product);
    useCampaignStore.getState().setPackage(mkPackage("popular"));
    const state = useCampaignStore.getState();
    expect(validateStep(5, state)).toEqual({ allowed: false, redirectTo: "/campaigns/new/creators" });
  });

  it("step 5 allowed after all data including creators", () => {
    useCampaignStore.getState().setCountry(mkCountry("thailand"));
    useCampaignStore.getState().setProduct(product);
    useCampaignStore.getState().setPackage(mkPackage("popular"));
    useCampaignStore.getState().setCreators([mkCreator("c1")]);
    const state = useCampaignStore.getState();
    expect(validateStep(5, state)).toEqual({ allowed: true });
  });

  it("countryData persists after setting other data", () => {
    useCampaignStore.getState().setCountry(mkCountry("malaysia"));
    useCampaignStore.getState().setProduct(product);
    expect(useCampaignStore.getState().countryData?.id).toBe("malaysia");
  });
});
