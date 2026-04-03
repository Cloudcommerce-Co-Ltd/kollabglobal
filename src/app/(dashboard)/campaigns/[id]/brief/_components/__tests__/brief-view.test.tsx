// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BriefView } from "../brief-view";

const mockContent = JSON.stringify({
  name: "Target Name",
  keys: "Target Key Message",
  dos: "Target Dos",
  deliverables: "Target Deliverables",
  disclosure: "Target Disclosure",
  deadline: "2026-05-01T00:00:00.000Z",
});

const mockContentTh = JSON.stringify({
  name: "Thai Name",
  keys: "Thai Key Message",
  dos: "Thai Dos",
  deliverables: "Thai Deliverables",
  disclosure: "Thai Disclosure",
  deadline: "2026-05-01T00:00:00.000Z",
});

const defaultProps = {
  campaignId: "c1",
  brandName: "BrandX",
  productName: "ProdY",
  isService: false,
  isPublished: true,
  briefContent: mockContent,
  briefContentTh: mockContentTh,
  targetLang: { code: "th", name: "Thai", countryCode: "TH" },
};

describe("BriefView", () => {
  it("renders Thai brief content by default", async () => {
    await act(async () => render(<BriefView {...defaultProps} />));
    expect(screen.getByText("Thai Name")).toBeInTheDocument();
    expect(screen.getByText("Thai Key Message")).toBeInTheDocument();
    expect(screen.getByText("Thai Dos")).toBeInTheDocument();
    expect(screen.getByText("เผยแพร่แล้ว")).toBeInTheDocument();
  });

  it("renders service pill when isService is true", async () => {
    await act(async () => render(<BriefView {...defaultProps} isService={true} />));
    expect(screen.getAllByText("บริการ").length).toBeGreaterThan(0);
  });

  it("handles language toggle", async () => {
    await act(async () => render(<BriefView {...defaultProps} />));
    expect(screen.getByText("Thai Key Message")).toBeInTheDocument();
    
    // Switch to target lang
    const tgtButton = screen.getByText("แปลภาษา").closest("button");
    expect(tgtButton).toBeInTheDocument();
    
    await act(async () => fireEvent.click(tgtButton!));
    
    // Should show loading then switched state
    await waitFor(() => {
      expect(screen.getByText("Target Key Message")).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it("falls back to raw content when briefContentTh is missing", async () => {
    await act(async () => render(<BriefView {...defaultProps} briefContentTh={null} />));
    // It should render target content directly if TH is null
    expect(screen.getByText("Target Name")).toBeInTheDocument();
  });

  it("handles malformed JSON gracefully", async () => {
    await act(async () => render(<BriefView {...defaultProps} briefContent="{" briefContentTh="{" />));
    expect(screen.getAllByText("ยังไม่มีข้อมูล").length).toBeGreaterThan(0);
    expect(screen.getByText("ยังไม่มีข้อมูล Brief")).toBeInTheDocument();
  });
});
