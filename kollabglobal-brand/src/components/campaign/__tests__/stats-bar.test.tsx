// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StatsBar } from "../stats-bar";

const defaultProps = {
  activeCount: 3,
  totalCount: 10,
  platformCount: 2,
  isLive: false,
  durationDisplay: { text: "เหลือ 5 วัน", isOverdue: false },
};

describe("StatsBar", () => {
  it("renders creator count", () => {
    render(<StatsBar {...defaultProps} />);
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  it("shows กำลังดำเนินการ when not live", () => {
    render(<StatsBar {...defaultProps} isLive={false} />);
    expect(screen.getByText("กำลังดำเนินการ")).toBeInTheDocument();
  });

  it("shows กำลัง Live when isLive=true", () => {
    render(<StatsBar {...defaultProps} isLive={true} />);
    expect(screen.getByText("กำลัง Live")).toBeInTheDocument();
  });

  it("renders duration text", () => {
    render(<StatsBar {...defaultProps} />);
    expect(screen.getByText("เหลือ 5 วัน")).toBeInTheDocument();
  });

  it("uses overdue styling when durationDisplay.isOverdue=true", () => {
    render(<StatsBar {...defaultProps} durationDisplay={{ text: "เกิน 2 วัน", isOverdue: true }} />);
    expect(screen.getByText("เกิน 2 วัน")).toBeInTheDocument();
  });

  it("renders duration label when provided", () => {
    render(
      <StatsBar
        {...defaultProps}
        durationDisplay={{ text: "เหลือ 3 วัน", isOverdue: false, label: "(โพสต์)" }}
      />
    );
    expect(screen.getByText(/โพสต์/)).toBeInTheDocument();
  });

  it("renders platform count", () => {
    render(<StatsBar {...defaultProps} platformCount={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
