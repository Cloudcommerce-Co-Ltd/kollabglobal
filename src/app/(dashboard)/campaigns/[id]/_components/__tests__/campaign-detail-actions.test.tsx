// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CampaignDetailActions } from "../campaign-detail-actions";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock the pipeline component to easily trigger its callbacks
vi.mock("@/components/campaign/creator-pipeline", () => ({
  CreatorPipeline: ({ onAllAccepted, onShipped, displayStatus }: any) => (
    <div data-testid="pipeline">
      <button data-testid="btn-accept" onClick={() => onAllAccepted?.("ACTIVE")}>Accept</button>
      <button data-testid="btn-ship" onClick={() => onShipped?.()}>Ship</button>
      <span>Status: {displayStatus}</span>
    </div>
  ),
}));

global.fetch = vi.fn();

describe("CampaignDetailActions", () => {
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ refresh: mockRefresh });
  });

  const defaultProps = {
    campaignId: "c1",
    serializedCampaign: { creators: [] },
    isService: false,
    campaignStatus: "ACCEPTING",
  };

  it("renders pipeline in accepting mode and handles callback", async () => {
    render(<CampaignDetailActions {...defaultProps} displayStatus="accepting" />);
    expect(screen.getByText("Status: accepting")).toBeInTheDocument();

    const fetchMock = vi.mocked(global.fetch).mockResolvedValueOnce({} as Response);
    
    await act(async () => {
      screen.getByTestId("btn-accept").click();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/campaigns/c1/status", expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ status: "ACTIVE" })
    }));
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("renders pipeline in ship mode and handles callback", async () => {
    render(<CampaignDetailActions {...defaultProps} displayStatus="ship" isDomestic={true} />);
    expect(screen.getByText("Status: ship")).toBeInTheDocument();

    const fetchMock = vi.mocked(global.fetch).mockResolvedValueOnce({} as Response);
    
    await act(async () => {
      screen.getByTestId("btn-ship").click();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/campaigns/c1/shipment", expect.objectContaining({
      method: "PATCH",
    }));
    expect(mockRefresh).toHaveBeenCalled();
  });
});
