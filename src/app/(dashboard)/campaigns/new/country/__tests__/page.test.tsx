// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectCountryPage from "../page";
import { useCampaignStore } from "@/stores/campaign-store";
import type { Country } from "@/types";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const mkCountry = (id: string, name: string, flag: string, creatorsAvail: number): Country => ({
  id, name, flag, creatorsAvail,
  avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null,
  snackTrend: null, platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
});

const SAMPLE_COUNTRIES: Country[] = [
  mkCountry("thailand", "Thailand", "🇹🇭", 1500),
  mkCountry("vietnam", "Vietnam", "🇻🇳", 840),
  mkCountry("usa", "United States", "🇺🇸", 1200),
  mkCountry("uk", "United Kingdom", "🇬🇧", 650),
];

beforeEach(() => {
  useCampaignStore.getState().reset();
  mockPush.mockClear();
  mockReplace.mockClear();

  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve(SAMPLE_COUNTRIES),
  } as unknown as Response);
});

describe("SelectCountryPage", () => {
  it("shows loading state initially", () => {
    render(<SelectCountryPage />);
    expect(screen.getByText("กำลังโหลด...")).toBeInTheDocument();
  });

  it("renders country cards after fetch", async () => {
    render(<SelectCountryPage />);
    await waitFor(() => expect(screen.getByText("Thailand")).toBeInTheDocument());
    expect(screen.getByText("Vietnam")).toBeInTheDocument();
  });

  it("Asia tab shows only Asia countries", async () => {
    render(<SelectCountryPage />);
    await waitFor(() => expect(screen.getByText("Thailand")).toBeInTheDocument());
    expect(screen.queryByText("United States")).not.toBeInTheDocument();
  });

  it("Global tab shows non-Asia countries", async () => {
    render(<SelectCountryPage />);
    await waitFor(() => expect(screen.getByText("Thailand")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Global"));
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.queryByText("Thailand")).not.toBeInTheDocument();
  });

  it("clicking a card selects it and calls setCountry", async () => {
    render(<SelectCountryPage />);
    await waitFor(() => expect(screen.getByText("Thailand")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Thailand").closest("button")!);
    expect(useCampaignStore.getState().countryData?.id).toBe("thailand");
  });

  it("CTA is disabled when no country selected", async () => {
    render(<SelectCountryPage />);
    await waitFor(() => expect(screen.getByText("Thailand")).toBeInTheDocument());
    const cta = screen.getByText("ถัดไป — เพิ่มสินค้า / บริการ");
    expect(cta).toBeDisabled();
  });

  it("CTA is enabled after selecting a country", async () => {
    render(<SelectCountryPage />);
    await waitFor(() => expect(screen.getByText("Thailand")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Thailand").closest("button")!);
    const cta = screen.getByText("ถัดไป — เพิ่มสินค้า / บริการ");
    expect(cta).not.toBeDisabled();
  });

  it("CTA navigates to product page on click", async () => {
    render(<SelectCountryPage />);
    await waitFor(() => expect(screen.getByText("Thailand")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Thailand").closest("button")!);
    fireEvent.click(screen.getByText("ถัดไป — เพิ่มสินค้า / บริการ"));
    expect(mockPush).toHaveBeenCalledWith("/campaigns/new/product");
  });

  it("pre-selects country from store on mount", async () => {
    useCampaignStore.getState().setCountry(mkCountry("vietnam", "Vietnam", "🇻🇳", 840));
    render(<SelectCountryPage />);
    await waitFor(() => expect(screen.getByText("Vietnam")).toBeInTheDocument());
    const cta = screen.getByText("ถัดไป — เพิ่มสินค้า / บริการ");
    expect(cta).not.toBeDisabled();
  });

  it("calls goToStep(1) on mount", async () => {
    useCampaignStore.getState().goToStep(3);
    render(<SelectCountryPage />);
    await waitFor(() => expect(useCampaignStore.getState().step).toBe(1));
  });
});
