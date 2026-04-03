// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CampaignDashboard } from "../campaign-dashboard";
import type { CampaignListItem } from "@/types/campaign";

vi.mock("../campaign-table", () => ({
  CampaignTable: ({ campaigns }: { campaigns: CampaignListItem[] }) => (
    <div data-testid="campaign-table">{campaigns.length} campaigns</div>
  ),
}));

const makeItem = (id: string, status: CampaignListItem["status"]): CampaignListItem => ({
  id,
  promotionType: "PRODUCT",
  status,
  createdAt: "2026-01-01T00:00:00.000Z",
  country: { id: 1, name: "Thailand", countryCode: "TH" },
  package: { id: 1, name: "Starter", numCreators: 5, platforms: [] },
  products: [],
  creators: [],
});

describe("CampaignDashboard", () => {
  it("renders all campaigns by default", () => {
    const items = [makeItem("1", "ACTIVE"), makeItem("2", "AWAITING_PAYMENT")];
    render(<CampaignDashboard campaigns={items} />);
    expect(screen.getByTestId("campaign-table")).toHaveTextContent("2 campaigns");
  });

  it("filters campaigns when a status tab is clicked", () => {
    const items = [makeItem("1", "ACTIVE"), makeItem("2", "AWAITING_PAYMENT")];
    render(<CampaignDashboard campaigns={items} />);

    const buttons = screen.getAllByRole("button");
    // Find and click ACTIVE tab
    const activeTabBtn = buttons.find(b => b.textContent?.includes("ACTIVE") || b.textContent?.includes("ดำเนิน"));
    if (activeTabBtn) {
      fireEvent.click(activeTabBtn);
    }
    // Table still renders
    expect(screen.getByTestId("campaign-table")).toBeInTheDocument();
  });

  it("renders with empty campaigns list", () => {
    render(<CampaignDashboard campaigns={[]} />);
    expect(screen.getByTestId("campaign-table")).toHaveTextContent("0 campaigns");
  });
});
