import { describe, it, expect } from "vitest";
import { resolveDisplayStatus, getStatusBadge } from "@/lib/campaign-detail-utils";
import type { CampaignWithRelations } from "@/types/campaign";

function makeCampaign(status: string, isService = false): CampaignWithRelations {
  return {
    id: "c1",
    countryId: 1,
    packageId: 1,
    promotionType: isService ? "SERVICE" : "PRODUCT",
    status,
    duration: 30,
    product: isService ? { isService: true, brandName: "", productName: "", category: "", description: "", sellingPoints: "", url: "", imageUrl: null } : null,
  };
}

describe("resolveDisplayStatus", () => {
  it("maps DRAFT to brief", () => expect(resolveDisplayStatus(makeCampaign("DRAFT"))).toBe("brief"));
  it("maps AWAITING_PAYMENT to brief", () => expect(resolveDisplayStatus(makeCampaign("AWAITING_PAYMENT"))).toBe("brief"));
  it("maps PENDING to brief", () => expect(resolveDisplayStatus(makeCampaign("PENDING"))).toBe("brief"));
  it("maps ACCEPTING to accepting", () => expect(resolveDisplayStatus(makeCampaign("ACCEPTING"))).toBe("accepting"));
  it("maps AWAITING_SHIPMENT (product) to ship", () => expect(resolveDisplayStatus(makeCampaign("AWAITING_SHIPMENT"))).toBe("ship"));
  it("maps AWAITING_SHIPMENT (service) to active", () => expect(resolveDisplayStatus(makeCampaign("AWAITING_SHIPMENT", true))).toBe("active"));
  it("maps ACTIVE to active", () => expect(resolveDisplayStatus(makeCampaign("ACTIVE"))).toBe("active"));
  it("maps COMPLETED to live", () => expect(resolveDisplayStatus(makeCampaign("COMPLETED"))).toBe("live"));
});

describe("getStatusBadge", () => {
  it("returns correct badge for brief", () => {
    const badge = getStatusBadge("brief");
    expect(badge.label).toBe("ต้องสร้าง Brief");
    expect(badge.cls).toContain("text-amber-700");
  });
  it("returns correct badge for accepting", () => {
    expect(getStatusBadge("accepting").label).toBe("รอตอบรับ");
  });
  it("returns correct badge for ship", () => {
    expect(getStatusBadge("ship").label).toBe("รอส่งสินค้า");
  });
  it("returns correct badge for active", () => {
    expect(getStatusBadge("active").label).toBe("กำลังดำเนินการ");
  });
  it("returns correct badge for live", () => {
    expect(getStatusBadge("live").label).toBe("Live");
  });
});
