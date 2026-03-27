// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectCountryPage from "../page";
import { useCampaignStore } from "@/stores/campaign-store";
import type { Country } from "@/types";

// Mock next/navigation — must include useSearchParams
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = { get: vi.fn(() => null) };
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

const mkCountry = (id: number, name: string, countryCode: string, creatorsAvail: number, region: string): Country => ({
  id, name, countryCode, region, languageCode: 'en', languageName: 'English', creatorsAvail,
  avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null,
  snackTrend: null, platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
});

const SAMPLE_COUNTRIES: Country[] = [
  mkCountry(1, "Thailand", "TH", 1500, "asia"),
  mkCountry(2, "Vietnam", "VN", 840, "asia"),
  mkCountry(7, "United States", "US", 1200, "global"),
  mkCountry(8, "United Kingdom", "GB", 650, "global"),
];

beforeEach(() => {
  useCampaignStore.getState().reset();
  mockPush.mockClear();
  mockReplace.mockClear();
  mockSearchParams.get.mockReturnValue(null); // default: no ?new=1

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
    expect(useCampaignStore.getState().countryData?.id).toBe(1);
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

  it("restores previously selected country from store without ?new=1", async () => {
    // Pre-populate store (simulates returning to step 1 via back button)
    useCampaignStore.getState().setCountry(mkCountry(1, "Thailand", "TH", 1500, "asia"));
    mockSearchParams.get.mockReturnValue(null); // no ?new=1
    render(<SelectCountryPage />);
    await waitFor(() => expect(screen.getByText("Thailand")).toBeInTheDocument());
    // CTA should be enabled because country is pre-selected from store
    const cta = screen.getByText("ถัดไป — เพิ่มสินค้า / บริการ");
    expect(cta).not.toBeDisabled();
  });

  it("resets store and clears selection when ?new=1 is present", async () => {
    // Pre-populate store
    useCampaignStore.getState().setCountry(mkCountry(2, "Vietnam", "VN", 840, "asia"));
    mockSearchParams.get.mockReturnValue("1"); // simulate ?new=1
    render(<SelectCountryPage />);
    await waitFor(() => expect(screen.getByText("Vietnam")).toBeInTheDocument());
    // CTA should be disabled because reset was called
    const cta = screen.getByText("ถัดไป — เพิ่มสินค้า / บริการ");
    expect(cta).toBeDisabled();
    // Store should be reset
    expect(useCampaignStore.getState().countryData).toBeNull();
  });
});
