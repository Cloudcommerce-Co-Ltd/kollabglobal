// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectCountryPage from "../page";
import { useCampaignStore } from "@/stores/campaign-store";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const SAMPLE_COUNTRIES = [
  { id: "thailand", name: "Thailand", flag: "🇹🇭", creatorsAvail: 1500, isActive: true },
  { id: "vietnam", name: "Vietnam", flag: "🇻🇳", creatorsAvail: 840, isActive: true },
  { id: "usa", name: "United States", flag: "🇺🇸", creatorsAvail: 1200, isActive: true },
  { id: "uk", name: "United Kingdom", flag: "🇬🇧", creatorsAvail: 650, isActive: true },
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
    expect(useCampaignStore.getState().countryId).toBe("thailand");
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
    useCampaignStore.getState().setCountry("vietnam");
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
