// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectCreatorsPage from "../page";
import { SAMPLE_CREATOR_AVATARS } from "@/lib/constants";

describe("SelectCreatorsPage", () => {
  it("renders title เลือกครีเอเตอร์", () => {
    render(<SelectCreatorsPage />);
    expect(screen.getByText("เลือกครีเอเตอร์")).toBeInTheDocument();
  });

  it("renders all 10 recommended creator names", () => {
    render(<SelectCreatorsPage />);
    for (const creator of SAMPLE_CREATOR_AVATARS.slice(0, 10)) {
      expect(screen.getAllByText(creator.name).length).toBeGreaterThan(0);
    }
  });

  it("renders all 5 backup creator names", () => {
    render(<SelectCreatorsPage />);
    for (const creator of SAMPLE_CREATOR_AVATARS.slice(10, 15)) {
      expect(screen.getAllByText(creator.name).length).toBeGreaterThan(0);
    }
  });

  it("shows AI recommendation banner", () => {
    render(<SelectCreatorsPage />);
    expect(screen.getByText("ทำไมถึงแนะนำครีเอเตอร์เหล่านี้?")).toBeInTheDocument();
  });

  it("first 10 creators are pre-selected visually", () => {
    render(<SelectCreatorsPage />);
    expect(screen.getByText("10/10 คนที่เลือก • เลือกได้สูงสุด 10 คน")).toBeInTheDocument();
  });

  it("clicking selected creator deselects it", () => {
    render(<SelectCreatorsPage />);
    const firstCreatorName = SAMPLE_CREATOR_AVATARS[0].name;
    const card = screen.getByText(firstCreatorName).closest("div[class*='rounded-xl']") as HTMLElement;
    fireEvent.click(card);
    expect(screen.getByText("9/10 คนที่เลือก • เลือกได้สูงสุด 10 คน")).toBeInTheDocument();
  });

  it("shows correct selection count in footer", () => {
    render(<SelectCreatorsPage />);
    expect(screen.getByText("✓ เลือกครบจำนวนแล้ว")).toBeInTheDocument();
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
