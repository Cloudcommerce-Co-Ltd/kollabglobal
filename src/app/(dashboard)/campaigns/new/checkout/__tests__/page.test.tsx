// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import CheckoutPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("@/stores/campaign-store", () => ({
  useCampaignStore: vi.fn(),
}));

const mockPackages = [
  {
    id: "starter",
    name: "Starter",
    numCreators: 5,
    pricePerCreator: 2500,
    discountPct: 0,
  },
];

const mockCreators = Array.from({ length: 10 }, (_, i) => ({
  id: `c${i + 1}`,
  name: `Creator ${i + 1}`,
  niche: "Fashion",
  platform: "Instagram",
  followers: 10000,
  engagementRate: 3.5,
  country: "TH",
  avatarUrl: null,
  bio: null,
  pricePerPost: 2500,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const mockStore = {
  countryId: "TH",
  packageId: "starter",
  promotionType: "PRODUCT" as const,
  selectedCreatorIds: ["c1", "c2", "c3", "c4", "c5"],
  setPackage: vi.fn(),
  setCreators: vi.fn(),
  setPromotionType: vi.fn(),
};

describe("CheckoutPage", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { useCampaignStore } = await import("@/stores/campaign-store");
    vi.mocked(useCampaignStore).mockReturnValue(mockStore as ReturnType<typeof useCampaignStore>);

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/packages") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPackages),
        });
      }
      if (url === "/api/creators") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCreators),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading spinner initially", async () => {
    // Delay the fetch so we can observe the loading state
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})); // never resolves

    const { useCampaignStore } = await import("@/stores/campaign-store");
    vi.mocked(useCampaignStore).mockReturnValue(mockStore as ReturnType<typeof useCampaignStore>);

    render(<CheckoutPage />);
    expect(screen.getByText("กำลังโหลด...")).toBeInTheDocument();
  });

  it("renders package details after loading", async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("แพ็กเกจ")).toBeInTheDocument();
    });

    expect(screen.getByText("30 วัน")).toBeInTheDocument();
    expect(screen.getByText("5 คน")).toBeInTheDocument();
  });

  it("shows price breakdown", async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("ค่าแพ็กเกจ")).toBeInTheDocument();
    });

    expect(screen.getByText("VAT 7%")).toBeInTheDocument();
    expect(screen.getByText("ค่าบริการ 3%")).toBeInTheDocument();
    expect(screen.getByText("รวมทั้งหมด")).toBeInTheDocument();
  });

  it("shows confirm button", async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("ยืนยันการชำระเงิน")).toBeInTheDocument();
    });
  });

  it("shows POC banner when auto-fill occurs (packageId is null in store)", async () => {
    const { useCampaignStore } = await import("@/stores/campaign-store");
    vi.mocked(useCampaignStore).mockReturnValue({
      ...mockStore,
      packageId: null,
      selectedCreatorIds: [],
    } as ReturnType<typeof useCampaignStore>);

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText(/POC Mode/)).toBeInTheDocument();
    });
  });

  it("fetches packages and creators when store has no packageId", async () => {
    const { useCampaignStore } = await import("@/stores/campaign-store");
    vi.mocked(useCampaignStore).mockReturnValue({
      ...mockStore,
      packageId: null,
      selectedCreatorIds: [],
    } as ReturnType<typeof useCampaignStore>);

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/packages");
      expect(global.fetch).toHaveBeenCalledWith("/api/creators");
    });
  });
});
