// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectCreatorsPage from "../page";
import { useCampaignStore } from "@/stores/campaign-store";
import type { Country, Creator, Package } from "@/types";

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

// 28 main creators + 5 backup creators
const MOCK_CREATORS: Creator[] = [
  ...Array.from({ length: 28 }, (_, i): Creator => ({
    id: `creator-${i}`,
    name: `Creator${i}`,
    niche: 'The Passport',
    engagement: 'N/A',
    reach: 'N/A',
    avatar: '',
    countryFlag: '🇹🇭',
    isBackup: false,
    platform: null, socialHandle: null, portfolioUrl: null,
  })),
  ...Array.from({ length: 5 }, (_, i): Creator => ({
    id: `creator-backup-${i}`,
    name: `BackupCreator${i}`,
    niche: 'ตัวสำรอง',
    engagement: 'N/A',
    reach: 'N/A',
    avatar: '',
    countryFlag: '🇹🇭',
    isBackup: true,
    platform: null, socialHandle: null, portfolioUrl: null,
  })),
];

const mkCountry = (id: number): Country => ({
  id, name: String(id), flag: '🏳️', region: 'global', languageCode: 'en', languageName: 'English',
  creatorsAvail: 0, avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null,
  snackTrend: null, platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
});

const mkPackage = (numCreators = 10): Package => ({
  id: 2, name: 'Popular', tagline: '', badge: null,
  numCreators, price: 33250, platforms: [], deliverables: [], cpmLabel: '', cpmSavings: '',
  estReach: '500K', estEngagement: '3%',
});

beforeEach(() => {
  useCampaignStore.getState().reset();
  useCampaignStore.getState().setCountry(mkCountry(1));
  useCampaignStore.getState().setProduct({
    brandName: 'Brand', productName: 'Product', category: 'Food',
    description: '', sellingPoints: '', url: '', imageUrl: '', isService: false,
  });
  useCampaignStore.getState().setPackage(mkPackage());
  mockPush.mockClear();
  mockReplace.mockClear();
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve(MOCK_CREATORS),
  } as unknown as Response);
});

describe("SelectCreatorsPage", () => {
  it("renders title เลือกครีเอเตอร์", () => {
    render(<SelectCreatorsPage />);
    expect(screen.getByText("เลือกครีเอเตอร์")).toBeInTheDocument();
  });

  it("renders all 10 recommended creator names", async () => {
    render(<SelectCreatorsPage />);
    for (const creator of MOCK_CREATORS.slice(0, 10)) {
      await waitFor(() =>
        expect(screen.getAllByText(creator.name).length).toBeGreaterThan(0)
      );
    }
  });

  it("renders all 5 backup creator names", async () => {
    render(<SelectCreatorsPage />);
    for (const creator of MOCK_CREATORS.slice(28, 33)) {
      await waitFor(() =>
        expect(screen.getAllByText(creator.name).length).toBeGreaterThan(0)
      );
    }
  });

  it("first 10 creators are pre-selected visually", async () => {
    render(<SelectCreatorsPage />);
    await waitFor(() =>
      expect(screen.getByText("10/10 คนที่เลือก • เลือกได้สูงสุด 10 คน")).toBeInTheDocument()
    );
  });

  it("clicking selected creator deselects it", async () => {
    render(<SelectCreatorsPage />);
    const firstCreatorName = MOCK_CREATORS[0].name;
    await waitFor(() => expect(screen.getAllByText(firstCreatorName).length).toBeGreaterThan(0));
    const card = screen.getByText(firstCreatorName).closest("div[class*='rounded-xl']") as HTMLElement;
    fireEvent.click(card);
    await waitFor(() =>
      expect(screen.getByText("9/10 คนที่เลือก • เลือกได้สูงสุด 10 คน")).toBeInTheDocument()
    );
  });

  it("shows correct selection count in footer", async () => {
    render(<SelectCreatorsPage />);
    await waitFor(() =>
      expect(screen.getByText("✓ เลือกครบจำนวนแล้ว")).toBeInTheDocument()
    );
  });

  it("shows CTA button ถัดไป — สรุปรายการ", () => {
    render(<SelectCreatorsPage />);
    expect(screen.getByText("ถัดไป — สรุปรายการ")).toBeInTheDocument();
  });

  it("shows yellow tip box for backup creators", async () => {
    render(<SelectCreatorsPage />);
    await waitFor(() =>
      expect(
        screen.getByText("ครีเอเตอร์สำรองจะถูกเรียกใช้งานโดยอัตโนมัติ หากครีเอเตอร์หลักไม่ตอบรับงาน")
      ).toBeInTheDocument()
    );
  });

  it("handleNext syncs selected creators to store", async () => {
    render(<SelectCreatorsPage />);
    await waitFor(() =>
      expect(screen.getByText("✓ เลือกครบจำนวนแล้ว")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("ถัดไป — สรุปรายการ"));
    expect(useCampaignStore.getState().selectedCreatorsData).toHaveLength(10);
  });

  it("uses numCreators from packageData as selection limit", async () => {
    useCampaignStore.getState().setPackage(mkPackage(5));
    render(<SelectCreatorsPage />);
    await waitFor(() =>
      expect(screen.getByText("5/5 คนที่เลือก • เลือกได้สูงสุด 5 คน")).toBeInTheDocument()
    );
  });

  it("toggle updates store immediately", async () => {
    render(<SelectCreatorsPage />);
    const firstCreatorName = MOCK_CREATORS[0].name;
    await waitFor(() => expect(screen.getAllByText(firstCreatorName).length).toBeGreaterThan(0));
    const card = screen.getByText(firstCreatorName).closest("div[class*='rounded-xl']") as HTMLElement;
    fireEvent.click(card);
    // Store should reflect the deselection immediately
    const state = useCampaignStore.getState();
    expect(state.selectedCreatorsData.find((c: Creator) => c.name === firstCreatorName)).toBeUndefined();
  });
});
