import { describe, it, expect } from "vitest";
import {
  calculatePackageTotal,
  getPackagePlatforms,
  getPackageDeliverables,
} from "@/lib/package-utils";

describe("calculatePackageTotal", () => {
  it("calculates total with no discount", () => {
    const result = calculatePackageTotal({
      numCreators: 5,
      pricePerCreator: 2000,
      discountPct: 0,
    });
    expect(result).toBe(10000);
  });

  it("calculates total with 10% discount", () => {
    const result = calculatePackageTotal({
      numCreators: 5,
      pricePerCreator: 2000,
      discountPct: 10,
    });
    expect(result).toBe(9000);
  });

  it("rounds to nearest integer", () => {
    const result = calculatePackageTotal({
      numCreators: 3,
      pricePerCreator: 1000,
      discountPct: 33,
    });
    // 3 * 1000 * (1 - 0.33) = 3000 * 0.67 = 2010
    expect(result).toBe(2010);
  });
});

describe("getPackagePlatforms", () => {
  it("returns platforms for known package", () => {
    expect(getPackagePlatforms(1)).toEqual(["tiktok"]);
    expect(getPackagePlatforms(2)).toEqual(["tiktok", "instagram"]);
    expect(getPackagePlatforms(3)).toEqual(["tiktok", "instagram", "facebook"]);
  });

  it("returns default platforms for unknown package", () => {
    expect(getPackagePlatforms(999)).toEqual(["tiktok", "instagram"]);
    expect(getPackagePlatforms(undefined)).toEqual(["tiktok", "instagram"]);
  });
});

describe("getPackageDeliverables", () => {
  it("returns deliverables for known package", () => {
    const deliverables = getPackageDeliverables(1);
    expect(deliverables).toHaveLength(1);
    expect(deliverables[0]).toContain("TikTok");
  });

  it("returns default deliverables for unknown package", () => {
    const deliverables = getPackageDeliverables(undefined);
    expect(deliverables.length).toBeGreaterThan(0);
  });
});
