// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectPackagePage from "../page";
import { useCampaignStore } from "@/stores/campaign-store";
import type { Country, Package } from "@/types";

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const mkCountry = (id: number): Country => ({
  id, name: String(id), flag: '🏳️', creatorsAvail: 0,
  avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null,
  snackTrend: null, platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
});

const SAMPLE_PACKAGES: Package[] = [
  {
    id: 1,
    name: "Starter",
    badge: null,
    numCreators: 5,
    pricePerCreator: 2500,
    discountPct: 0,
    estReach: "150K–400K",
    estEngagement: "2.5–4.0%",
  },
  {
    id: 2,
    name: "Popular",
    badge: "แนะนำ",
    numCreators: 10,
    pricePerCreator: 3500,
    discountPct: 5,
    estReach: "500K–1.2M",
    estEngagement: "3.5–5.5%",
  },
  {
    id: 3,
    name: "Value",
    badge: null,
    numCreators: 15,
    pricePerCreator: 4800,
    discountPct: 10,
    estReach: "1.2M–3M",
    estEngagement: "4.0–6.0%",
  },
];

beforeEach(() => {
  useCampaignStore.getState().reset();
  // Set a countryData so the guard passes
  useCampaignStore.getState().setCountry(mkCountry(1));
  mockPush.mockClear();
  mockReplace.mockClear();

  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve(SAMPLE_PACKAGES),
  } as unknown as Response);
});

describe("SelectPackagePage", () => {
  it("shows loading state initially", () => {
    render(<SelectPackagePage />);
    expect(screen.getByText("กำลังโหลด...")).toBeInTheDocument();
  });

  it("renders 3 package cards after fetch", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("Starter")).toBeInTheDocument());
    expect(screen.getByText("Popular")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
  });

  it("auto-selects Popular package (has badge)", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("Popular")).toBeInTheDocument());
    expect(useCampaignStore.getState().packageData?.id).toBe(2);
  });

  it("clicking a different card updates the store", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("Starter")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Starter"));
    expect(useCampaignStore.getState().packageData?.id).toBe(1);
  });

  it("shows discount savings badge for packages with discount", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("Popular")).toBeInTheDocument());
    expect(screen.getByText("ประหยัด 5%")).toBeInTheDocument();
    expect(screen.getByText("ประหยัด 10%")).toBeInTheDocument();
  });

  it("CTA navigates to creators page", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("Popular")).toBeInTheDocument());
    fireEvent.click(screen.getByText("ยืนยัน — เลือกครีเอเตอร์"));
    expect(mockPush).toHaveBeenCalledWith("/campaigns/new/creators");
  });

  it("back button navigates to product page", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("Popular")).toBeInTheDocument());
    fireEvent.click(screen.getByText("กลับไปเพิ่มสินค้า / บริการ"));
    expect(mockPush).toHaveBeenCalledWith("/campaigns/new/product");
  });

  it("shows price per creator correctly", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("Starter")).toBeInTheDocument());
    expect(screen.getByText("฿2,500")).toBeInTheDocument();
    expect(screen.getByText("฿3,500")).toBeInTheDocument();
    expect(screen.getByText("฿4,800")).toBeInTheDocument();
  });
});
