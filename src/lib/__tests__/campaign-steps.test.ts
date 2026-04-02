import { describe, it, expect } from "vitest";
import { getStepFromPathname, validateStep } from "../campaign-steps";
import type { Country, Package, CreatorWithPackageInfo } from "@/types";
import type { ProductData } from "@/types/campaign";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const country: Country = {
  id: 1, name: "Thailand", countryCode: "TH", region: "asia", languageCode: "th", languageName: "Thai",
  creatorsAvail: 1500, platforms: [], estReach: null, isActive: true,
};

const product: ProductData = {
  brandName: "Brand", productName: "Product", category: "Food",
  description: "", sellingPoints: "", url: "", imageUrl: "", isService: false,
};

const pkg: Package = {
  id: 1, name: "Popular", tagline: "", badge: null,
  numCreators: 10, price: 33250, platforms: [], deliverables: [], cpmLabel: "", cpmSavings: "",
  estReach: null, estEngagement: null,
};

const creator: CreatorWithPackageInfo = {
  id: "c1", name: "Creator", niche: "Food", engagement: "5%",
  reach: "100K", avatar: "👩", countryCode: 'TH', countryId: null, isBackup: false, sortOrder: 0,
  platform: null, socialHandle: null, portfolioUrl: null,
};

const empty = { countryData: null, productData: null, packageData: null, selectedCreatorsData: [] };
const withCountry = { ...empty, countryData: country };
const withProduct = { ...withCountry, productData: product };
const withPackage = { ...withProduct, packageData: pkg };
const withCreators = { ...withPackage, selectedCreatorsData: [creator] };

// ─── getStepFromPathname ──────────────────────────────────────────────────────

describe("getStepFromPathname", () => {
  it("returns 1 for /campaigns/new/country", () => {
    expect(getStepFromPathname("/campaigns/new/country")).toBe(1);
  });

  it("returns 2 for /campaigns/new/product", () => {
    expect(getStepFromPathname("/campaigns/new/product")).toBe(2);
  });

  it("returns 3 for /campaigns/new/package", () => {
    expect(getStepFromPathname("/campaigns/new/package")).toBe(3);
  });

  it("returns 4 for /campaigns/new/creators", () => {
    expect(getStepFromPathname("/campaigns/new/creators")).toBe(4);
  });

  it("returns 5 for /campaigns/new/checkout", () => {
    expect(getStepFromPathname("/campaigns/new/checkout")).toBe(5);
  });

  it("returns null for unknown path", () => {
    expect(getStepFromPathname("/campaigns/new")).toBeNull();
  });

  it("returns null for dashboard root", () => {
    expect(getStepFromPathname("/")).toBeNull();
  });

  it("returns null for unrelated path", () => {
    expect(getStepFromPathname("/campaigns/some-id")).toBeNull();
  });
});

// ─── validateStep ────────────────────────────────────────────────────────────

describe("validateStep", () => {
  // step 1 — country
  it("step 1 is always allowed with empty store", () => {
    expect(validateStep(1, empty)).toEqual({ allowed: true });
  });

  it("step 1 is allowed even with all data present", () => {
    expect(validateStep(1, withCreators)).toEqual({ allowed: true });
  });

  // step 2 — product
  it("step 2 is allowed when countryData is set", () => {
    expect(validateStep(2, withCountry)).toEqual({ allowed: true });
  });

  it("step 2 is blocked when countryData is null, redirects to country", () => {
    expect(validateStep(2, empty)).toEqual({ allowed: false, redirectTo: "/campaigns/new/country" });
  });

  // step 3 — package
  it("step 3 is allowed when countryData + productData present", () => {
    expect(validateStep(3, withProduct)).toEqual({ allowed: true });
  });

  it("step 3 is blocked when only countryData, redirects to product", () => {
    expect(validateStep(3, withCountry)).toEqual({ allowed: false, redirectTo: "/campaigns/new/product" });
  });

  it("step 3 is blocked when nothing, redirects to country", () => {
    expect(validateStep(3, empty)).toEqual({ allowed: false, redirectTo: "/campaigns/new/country" });
  });

  // step 4 — creators
  it("step 4 is allowed when country + product + package present", () => {
    expect(validateStep(4, withPackage)).toEqual({ allowed: true });
  });

  it("step 4 blocked when packageData missing, redirects to package", () => {
    expect(validateStep(4, withProduct)).toEqual({ allowed: false, redirectTo: "/campaigns/new/package" });
  });

  it("step 4 blocked when productData missing, redirects to product", () => {
    expect(validateStep(4, withCountry)).toEqual({ allowed: false, redirectTo: "/campaigns/new/product" });
  });

  it("step 4 blocked when all missing, redirects to country", () => {
    expect(validateStep(4, empty)).toEqual({ allowed: false, redirectTo: "/campaigns/new/country" });
  });

  // step 5 — checkout
  it("step 5 is allowed when all data present including creators", () => {
    expect(validateStep(5, withCreators)).toEqual({ allowed: true });
  });

  it("step 5 blocked when selectedCreatorsData empty, redirects to creators", () => {
    expect(validateStep(5, withPackage)).toEqual({ allowed: false, redirectTo: "/campaigns/new/creators" });
  });

  it("step 5 blocked when packageData missing, redirects to package", () => {
    expect(validateStep(5, withProduct)).toEqual({ allowed: false, redirectTo: "/campaigns/new/package" });
  });

  // null step
  it("null step is always allowed", () => {
    expect(validateStep(null, empty)).toEqual({ allowed: true });
  });
});
