// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CampaignTable } from "../campaign-table";
import type { CampaignListItem } from "@/types/campaign";

const mockCampaigns: CampaignListItem[] = [
  {
    id: "c1",
    promotionType: "PRODUCT",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    country: { id: 1, name: "Thailand", countryCode: "TH" },
    package: { id: 1, name: "Pack A", numCreators: 5, platforms: ["tiktok"] },
    product: { brandName: "BrandX", productName: "ProdY", isService: false, imageUrl: "/img.jpg" },
    creators: [{ status: "ACCEPTED" }, { status: "PENDING" }],
  },
  {
    id: "c2",
    promotionType: "SERVICE",
    status: "ACCEPTING",
    createdAt: new Date().toISOString(),
    country: null,
    package: null,
    product: null,
    creators: [],
  },
  {
    id: "c3",
    promotionType: "PRODUCT",
    status: "AWAITING_PAYMENT",
    createdAt: new Date().toISOString(),
    country: null,
    package: null,
    product: { brandName: "B", productName: "P", isService: false, imageUrl: "" },
    creators: [],
  }
];

describe("CampaignTable", () => {
  it("renders empty state when no campaigns are provided", () => {
    render(<CampaignTable campaigns={[]} />);
    expect(screen.getByText("ยังไม่มีแคมเปญ")).toBeInTheDocument();
    expect(screen.getByText("สร้างแคมเปญแรก")).toBeInTheDocument();
  });

  it("renders campaigns in the table", () => {
    render(<CampaignTable campaigns={mockCampaigns} />);
    // Check first campaign
    expect(screen.getAllByText("ProdY").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Thailand").length).toBeGreaterThan(0);
    
    // c2 product name fallback
    expect(screen.getAllByText("แคมเปญ #c2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("บริการ").length).toBeGreaterThan(0);
    
    // NEW tags
    expect(screen.getAllByText("NEW").length).toBeGreaterThan(0);
  });

  it("links to correct url based on status", () => {
    render(<CampaignTable campaigns={mockCampaigns} />);
    const links = screen.getAllByRole("link");
    expect(links.some(l => l.getAttribute("href") === "/campaigns/c1")).toBe(true);
    expect(links.some(l => l.getAttribute("href") === "/campaigns/c3/checkout")).toBe(true);
  });
});
