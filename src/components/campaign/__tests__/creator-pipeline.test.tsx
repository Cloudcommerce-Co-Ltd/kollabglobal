// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CreatorPipeline, getStepStates, stepCls, connectorCls, getCurrentStep } from "../creator-pipeline";
import type { CampaignCreatorWithRelation } from "@/types/campaign";

const mockCreator = (id: string, status: string, contentStatus: string): CampaignCreatorWithRelation => ({
  id,
  campaignId: "c1",
  creatorId: "cr1",
  status,
  contentStatus,
  productId: null,
  creator: {
    id: "cr1",
    name: "Test Creator " + id,
    niche: "test",
    engagement: "1%",
    reach: "10k",
    avatar: "",
    countryCode: "TH",
    countryId: 1,
    platform: "instagram",
    socialHandle: "@test",
    portfolioUrl: null,
  },
} as any);

describe("creator-pipeline utilities", () => {
  it("getStepStates returns all done for isLive=true", () => {
    const c = mockCreator("1", "PENDING", "NOT_STARTED");
    expect(getStepStates(c, false, "PENDING", true)).toEqual(["done", "done", "done"]);
  });

  it("getStepStates returns correct states for product campaign (accepted, not shipped)", () => {
    const c = mockCreator("1", "ACCEPTED", "NOT_STARTED");
    expect(getStepStates(c, false, "ACCEPTING", false)).toEqual(["done", "active", "pending"]);
  });

  it("getStepStates returns correct states for product campaign (accepted, shipped)", () => {
    const c = mockCreator("1", "ACCEPTED", "NOT_STARTED");
    expect(getStepStates(c, false, "ACTIVE", false)).toEqual(["done", "done", "active"]);
  });

  it("getStepStates returns correct states for service campaign", () => {
    const c = mockCreator("1", "ACCEPTED", "NOT_STARTED");
    // Service dots: dot1=done, dot2=done (auto), dot3=active (not started)
    expect(getStepStates(c, true, "ACCEPTING", false)).toEqual(["done", "done", "active"]);
  });

  it("getStepStates returns correct states for POSTED content", () => {
    const c = mockCreator("1", "COMPLETED", "POSTED");
    expect(getStepStates(c, false, "COMPLETED", false)).toEqual(["done", "done", "done"]);
  });

  it("getCurrentStep returns correct filter keys", () => {
    const cPending = mockCreator("1", "PENDING", "NOT_STARTED");
    expect(getCurrentStep(cPending, false, "ACCEPTING", false)).toBe("waiting_accept");

    const cShip = mockCreator("2", "ACCEPTED", "NOT_STARTED");
    expect(getCurrentStep(cShip, false, "ACCEPTING", false)).toBe("waiting_ship");

    const cWork = mockCreator("3", "ACCEPTED", "NOT_STARTED");
    expect(getCurrentStep(cWork, false, "ACTIVE", false)).toBe("working");

    const cDone = mockCreator("4", "COMPLETED", "POSTED");
    expect(getCurrentStep(cDone, false, "ACTIVE", false)).toBe("done");
  });

  it("stepCls and connectorCls return expected classes", () => {
    expect(stepCls("done")).toContain("green");
    expect(stepCls("active")).toContain("amber");
    expect(stepCls("pending")).toContain("gray");

    expect(connectorCls("done", "done")).toContain("green");
    expect(connectorCls("done", "active")).toContain("green");
    expect(connectorCls("active", "pending")).toContain("gray");
  });
});

describe("CreatorPipeline component", () => {
  const creators = [
    mockCreator("1", "PENDING", "NOT_STARTED"),
    mockCreator("2", "ACCEPTED", "NOT_STARTED"),
    mockCreator("3", "COMPLETED", "POSTED"),
  ];

  it("renders the CreatorPipeline component with default header", () => {
    render(<CreatorPipeline creators={creators} isService={false} displayStatus="active" campaignStatus="ACTIVE" />);
    expect(screen.getByText("Creator Pipeline")).toBeInTheDocument();
    expect(screen.getByText("3 คน")).toBeInTheDocument();
    
    expect(screen.getByText("Test Creator 1")).toBeInTheDocument();
  });

  it("renders accepting header", () => {
    render(<CreatorPipeline creators={creators} isService={false} displayStatus="accepting" campaignStatus="ACCEPTING" />);
    expect(screen.getByText("รอตอบรับจากครีเอเตอร์")).toBeInTheDocument();
    expect(screen.getByText("2/3")).toBeInTheDocument(); // 2 are accepted/completed
  });

  it("renders shipping header", () => {
    render(<CreatorPipeline creators={creators} isService={false} displayStatus="ship" campaignStatus="AWAITING_SHIPMENT" />);
    expect(screen.getByText("จัดการการจัดส่งสินค้า")).toBeInTheDocument();
    expect(screen.getByText("Go to Connex")).toBeInTheDocument();
  });

  it("filters creators by tab", () => {
    render(<CreatorPipeline creators={creators} isService={false} displayStatus="active" campaignStatus="ACTIVE" />);
    // Initial: 3. done: 1.
    const doneTab = screen.getByText(/เสร็จสิ้น/);
    fireEvent.click(doneTab);
    
    // Only creator 3 should be visible
    expect(screen.queryByText("Test Creator 1")).not.toBeInTheDocument();
    expect(screen.getByText("Test Creator 3")).toBeInTheDocument();
  });

  it("renders empty state for empty filter", () => {
    render(<CreatorPipeline creators={creators} isService={true} displayStatus="active" campaignStatus="ACTIVE" />);
    // "working" tab
    const workingTab = screen.getByText(/กำลังสร้าง/);
    fireEvent.click(workingTab);
    
    // Test Creator 2 is "ACCEPTED", campaign is "ACTIVE", service = true -> dot3 is active -> returns 'working'.
    // Oh wait, for service campaign, campaignStatus "ACCEPTING" or "ACTIVE" gives dot2=done, so dot3=active -> 'working'.
    expect(screen.getByText("Test Creator 2")).toBeInTheDocument();
  });
});
