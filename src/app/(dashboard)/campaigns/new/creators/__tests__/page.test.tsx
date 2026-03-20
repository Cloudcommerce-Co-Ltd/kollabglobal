// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectCreatorsPage from "../page";
import { SAMPLE_CREATOR_AVATARS } from "@/lib/constants";
import { useCampaignStore } from "@/stores/campaign-store";
import type { Creator } from "@/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Build Creator fixtures matching SAMPLE_CREATOR_AVATARS (10 main + 5 backup)
const MOCK_CREATORS: Creator[] = SAMPLE_CREATOR_AVATARS.map((c, i) => ({
  id: `creator-${i}`,
  name: c.name,
  niche: c.niche,
  engagement: c.eng,
  reach: c.reach,
  avatar: c.avatar,
  countryFlag: c.flag,
  isBackup: i >= 10,
}));

beforeEach(() => {
  useCampaignStore.getState().reset();
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
    for (const creator of SAMPLE_CREATOR_AVATARS.slice(0, 10)) {
      await waitFor(() =>
        expect(screen.getAllByText(creator.name).length).toBeGreaterThan(0)
      );
    }
  });

  it("renders all 5 backup creator names", async () => {
    render(<SelectCreatorsPage />);
    for (const creator of SAMPLE_CREATOR_AVATARS.slice(10, 15)) {
      await waitFor(() =>
        expect(screen.getAllByText(creator.name).length).toBeGreaterThan(0)
      );
    }
  });

  it("shows AI recommendation banner", () => {
    render(<SelectCreatorsPage />);
    expect(screen.getByText("ทำไมถึงแนะนำครีเอเตอร์เหล่านี้?")).toBeInTheDocument();
  });

  it("first 10 creators are pre-selected visually", async () => {
    render(<SelectCreatorsPage />);
    await waitFor(() =>
      expect(screen.getByText("10/10 คนที่เลือก • เลือกได้สูงสุด 10 คน")).toBeInTheDocument()
    );
  });

  it("clicking selected creator deselects it", async () => {
    render(<SelectCreatorsPage />);
    const firstCreatorName = SAMPLE_CREATOR_AVATARS[0].name;
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

  it("shows yellow tip box for backup creators", () => {
    render(<SelectCreatorsPage />);
    expect(
      screen.getByText("ครีเอเตอร์สำรองจะถูกเรียกใช้งานโดยอัตโนมัติ หากครีเอเตอร์หลักไม่ตอบรับงาน")
    ).toBeInTheDocument();
  });
});
