// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectPackagePage from "../page";
import { useCampaignStore } from "@/stores/campaign-store";

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const SAMPLE_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    badge: null,
    numCreators: 5,
    pricePerCreator: 2500,
    discountPct: 0,
    estReach: "150K–400K",
    estEngagement: "2.5–4.0%",
  },
  {
    id: "popular",
    name: "Popular",
    badge: "แนะนำ",
    numCreators: 10,
    pricePerCreator: 3500,
    discountPct: 5,
    estReach: "500K–1.2M",
    estEngagement: "3.5–5.5%",
  },
  {
    id: "value",
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
  // Set a countryId so the guard passes
  useCampaignStore.getState().setCountry("thailand");
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
    expect(useCampaignStore.getState().packageId).toBe("popular");
  });

  it("clicking a different card updates the store", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("Starter")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Starter"));
    expect(useCampaignStore.getState().packageId).toBe("starter");
  });

  it("shows discount savings badge for packages with discount", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("Popular")).toBeInTheDocument());
    expect(screen.getByText("ประหยัด 5%")).toBeInTheDocument();
    expect(screen.getByText("ประหยัด 10%")).toBeInTheDocument();
  });

  it("redirects to country page if no countryId in store", async () => {
    useCampaignStore.getState().reset(); // clears countryId
    render(<SelectPackagePage />);
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith("/campaigns/new/country")
    );
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

  it("calls goToStep(3) on mount", async () => {
    useCampaignStore.getState().goToStep(1);
    render(<SelectPackagePage />);
    await waitFor(() => expect(useCampaignStore.getState().step).toBe(3));
  });

  it("shows price per creator correctly", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("Starter")).toBeInTheDocument());
    expect(screen.getByText("฿2,500")).toBeInTheDocument();
    expect(screen.getByText("฿3,500")).toBeInTheDocument();
    expect(screen.getByText("฿4,800")).toBeInTheDocument();
  });
});
