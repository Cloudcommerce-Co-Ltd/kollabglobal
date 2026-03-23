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
  id, name: String(id), flag: '🏳️', region: 'global', languageCode: 'en', languageName: 'English',
  creatorsAvail: 0, avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null,
  snackTrend: null, platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
});

const SAMPLE_PACKAGES: Package[] = [
  {
    id: 1,
    name: "The Passport",
    tagline: "เริ่มต้นออกสู่ตลาดโลก",
    badge: null,
    numCreators: 5,
    price: 2500,
    platforms: ["tiktok"],
    deliverables: ["TikTok 1 วิดีโอ (15–60 วิ)"],
    cpmLabel: "฿41 / 1K reach",
    cpmSavings: "76%",
    estReach: "150K–400K",
    estEngagement: "2.5–4.0%",
  },
  {
    id: 2,
    name: "The Global Bridge",
    tagline: "ขยายฐานข้ามแพลตฟอร์ม",
    badge: "แนะนำ",
    numCreators: 10,
    price: 3500,
    platforms: ["tiktok", "instagram"],
    deliverables: ["TikTok 1 วิดีโอ (15–60 วิ)", "IG 1 Reel + 3 Stories"],
    cpmLabel: "฿39 / 1K reach",
    cpmSavings: "77%",
    estReach: "500K–1.2M",
    estEngagement: "3.5–5.5%",
  },
  {
    id: 3,
    name: "The World Dominator",
    tagline: "ครองทุกแพลตฟอร์มพร้อมกัน",
    badge: null,
    numCreators: 15,
    price: 4800,
    platforms: ["tiktok", "instagram", "facebook"],
    deliverables: ["TikTok 1 วิดีโอ (15–60 วิ)", "IG 1 Reel + 3 Stories", "Facebook 2 โพสต์"],
    cpmLabel: "฿30 / 1K reach",
    cpmSavings: "82%",
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

  it("renders 3 package cards with display names after fetch", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("The Passport")).toBeInTheDocument());
    expect(screen.getByText("The Global Bridge")).toBeInTheDocument();
    expect(screen.getByText("The World Dominator")).toBeInTheDocument();
  });

  it("auto-selects Popular package (has badge)", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("The Global Bridge")).toBeInTheDocument());
    expect(useCampaignStore.getState().packageData?.id).toBe(2);
  });

  it("clicking a different card updates the store", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("The Passport")).toBeInTheDocument());
    fireEvent.click(screen.getByText("The Passport"));
    expect(useCampaignStore.getState().packageData?.id).toBe(1);
  });

  it("renders taglines for each package", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("The Passport")).toBeInTheDocument());
    expect(screen.getByText("เริ่มต้นออกสู่ตลาดโลก")).toBeInTheDocument();
    expect(screen.getByText("ขยายฐานข้ามแพลตฟอร์ม")).toBeInTheDocument();
    expect(screen.getByText("ครองทุกแพลตฟอร์มพร้อมกัน")).toBeInTheDocument();
  });

  it("shows total prices prominently", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("The Passport")).toBeInTheDocument());
    // totals = numCreators * price: 5*2500=12500, 10*3500=35000, 15*4800=72000
    expect(screen.getByText("฿12,500")).toBeInTheDocument();
    expect(screen.getByText("฿35,000")).toBeInTheDocument();
    expect(screen.getByText("฿72,000")).toBeInTheDocument();
  });

  it("renders CPM strip with savings data", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("The Passport")).toBeInTheDocument());
    expect(screen.getAllByText("CPM ถูกกว่า Google")).toHaveLength(3);
    expect(screen.getByText("76%")).toBeInTheDocument();
    expect(screen.getByText("77%")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
  });

  it("renders footer CPM disclaimer", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("The Passport")).toBeInTheDocument());
    expect(screen.getByText(/CPM คำนวณจาก reach กลาง/)).toBeInTheDocument();
  });

  it("CTA navigates to creators page", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("The Global Bridge")).toBeInTheDocument());
    fireEvent.click(screen.getByText("ยืนยัน — เลือกครีเอเตอร์"));
    expect(mockPush).toHaveBeenCalledWith("/campaigns/new/creators");
  });

  it("back button navigates to product page", async () => {
    render(<SelectPackagePage />);
    await waitFor(() => expect(screen.getByText("The Global Bridge")).toBeInTheDocument());
    fireEvent.click(screen.getByText("กลับไปเพิ่มสินค้า / บริการ"));
    expect(mockPush).toHaveBeenCalledWith("/campaigns/new/product");
  });
});
