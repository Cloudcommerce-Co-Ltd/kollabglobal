import { describe, it, expect } from "vitest";
import {
  calculatePackageTotal,
  getPackagePlatforms,
  getPackageDeliverables,
} from "@/lib/package-utils";

describe("calculatePackageTotal", () => {
  it("calculates total as numCreators * price", () => {
    const result = calculatePackageTotal({ numCreators: 5, price: 2000 });
    expect(result).toBe(10000);
  });

  it("calculates total for larger package", () => {
    const result = calculatePackageTotal({ numCreators: 10, price: 3500 });
    expect(result).toBe(35000);
  });

  it("calculates total for value package", () => {
    const result = calculatePackageTotal({ numCreators: 15, price: 4800 });
    expect(result).toBe(72000);
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
