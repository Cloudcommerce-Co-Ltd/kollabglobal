// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CampaignNewLayout from "../layout";
import { useCampaignStore } from "@/stores/campaign-store";
import type { Country, Package, Creator } from "@/types";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: vi.fn(() => "/campaigns/new/country"),
}));

import { usePathname } from "next/navigation";

const mkCountry = (): Country => ({
  id: "th", name: "Thailand", flag: "🇹🇭", creatorsAvail: 1500,
  avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null,
  snackTrend: null, platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
});

const mkPackage = (): Package => ({
  id: "popular", name: "Popular", badge: null,
  numCreators: 10, pricePerCreator: 3500, discountPct: 0,
  estReach: null, estEngagement: null,
});

const mkCreator = (): Creator => ({
  id: "c1", name: "Creator", niche: "Food", engagement: "5%",
  reach: "100K", avatar: "👩", countryFlag: "🇹🇭", isBackup: false,
});

beforeEach(() => {
  useCampaignStore.getState().reset();
  mockReplace.mockClear();
  vi.mocked(usePathname).mockReturnValue("/campaigns/new/country");
});

describe("CampaignNewLayout", () => {
  it("renders children when guard passes", () => {
    render(
      <CampaignNewLayout>
        <div data-testid="child">hello</div>
      </CampaignNewLayout>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("redirects when step 2 attempted without countryData", () => {
    vi.mocked(usePathname).mockReturnValue("/campaigns/new/product");
    render(
      <CampaignNewLayout>
        <div>product page</div>
      </CampaignNewLayout>
    );
    expect(mockReplace).toHaveBeenCalledWith("/campaigns/new/country");
    expect(screen.queryByText("product page")).not.toBeInTheDocument();
  });

  it("redirects when step 3 attempted with only countryData", () => {
    vi.mocked(usePathname).mockReturnValue("/campaigns/new/package");
    useCampaignStore.getState().setCountry(mkCountry());
    render(
      <CampaignNewLayout>
        <div>package page</div>
      </CampaignNewLayout>
    );
    expect(mockReplace).toHaveBeenCalledWith("/campaigns/new/product");
    expect(screen.queryByText("package page")).not.toBeInTheDocument();
  });

  it("allows step 4 when country + product + package present", () => {
    vi.mocked(usePathname).mockReturnValue("/campaigns/new/creators");
    useCampaignStore.getState().setCountry(mkCountry());
    useCampaignStore.getState().setProduct({
      brandName: "B", productName: "P", category: "Food",
      description: "", sellingPoints: "", url: "", imageUrl: "", isService: false,
    });
    useCampaignStore.getState().setPackage(mkPackage());
    render(
      <CampaignNewLayout>
        <div>creators page</div>
      </CampaignNewLayout>
    );
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText("creators page")).toBeInTheDocument();
  });

  it("redirects step 5 to creators when no creators selected", () => {
    vi.mocked(usePathname).mockReturnValue("/campaigns/new/checkout");
    useCampaignStore.getState().setCountry(mkCountry());
    useCampaignStore.getState().setProduct({
      brandName: "B", productName: "P", category: "Food",
      description: "", sellingPoints: "", url: "", imageUrl: "", isService: false,
    });
    useCampaignStore.getState().setPackage(mkPackage());
    render(
      <CampaignNewLayout>
        <div>checkout page</div>
      </CampaignNewLayout>
    );
    expect(mockReplace).toHaveBeenCalledWith("/campaigns/new/creators");
    expect(screen.queryByText("checkout page")).not.toBeInTheDocument();
  });

  it("allows step 5 when all data present", () => {
    vi.mocked(usePathname).mockReturnValue("/campaigns/new/checkout");
    useCampaignStore.getState().setCountry(mkCountry());
    useCampaignStore.getState().setProduct({
      brandName: "B", productName: "P", category: "Food",
      description: "", sellingPoints: "", url: "", imageUrl: "", isService: false,
    });
    useCampaignStore.getState().setPackage(mkPackage());
    useCampaignStore.getState().setCreators([mkCreator()]);
    render(
      <CampaignNewLayout>
        <div>checkout page</div>
      </CampaignNewLayout>
    );
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText("checkout page")).toBeInTheDocument();
  });
});
