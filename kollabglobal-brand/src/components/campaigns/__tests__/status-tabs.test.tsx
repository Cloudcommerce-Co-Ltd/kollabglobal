// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StatusTabs } from "../status-tabs";

const defaultProps = {
  activeTab: "all" as const,
  onTabChange: vi.fn(),
  counts: { AWAITING_PAYMENT: 2, ACTIVE: 1 },
  totalCount: 5,
};

describe("StatusTabs", () => {
  it("renders the All tab with total count", () => {
    render(<StatusTabs {...defaultProps} />);
    expect(screen.getByText(/5\)/)).toBeInTheDocument();
  });

  it("calls onTabChange when a tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<StatusTabs {...defaultProps} onTabChange={onTabChange} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onTabChange).toHaveBeenCalled();
  });

  it("applies active styling to the activeTab", () => {
    const { container } = render(<StatusTabs {...defaultProps} activeTab="all" />);
    const activeBtn = container.querySelector(".border-brand");
    expect(activeBtn).toBeInTheDocument();
  });
});
