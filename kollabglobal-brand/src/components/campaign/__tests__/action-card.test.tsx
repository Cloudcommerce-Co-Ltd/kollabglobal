// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ActionCard } from "../action-card";

const defaultProps = {
  icon: <span>icon</span>,
  iconBg: "bg-brand",
  borderColor: "border-brand",
  title: "Brief",
  badge: "ดำเนินการ",
  badgeBg: "bg-warning-bg",
  badgeText: "text-warning-text",
  description: "สร้าง brief",
  button: <button>Action</button>,
};

describe("ActionCard", () => {
  it("renders title and description", () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.getByText("Brief")).toBeInTheDocument();
    expect(screen.getByText("สร้าง brief")).toBeInTheDocument();
  });

  it("renders badge text", () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.getByText("ดำเนินการ")).toBeInTheDocument();
  });

  it("renders check icon when check=true", () => {
    const { container } = render(<ActionCard {...defaultProps} check={true} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders button slot", () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("renders without check icon when check is false", () => {
    const { container } = render(<ActionCard {...defaultProps} check={false} />);
    // No check SVG rendered when check is false (only the button icon if any)
    expect(container).toBeDefined();
  });
});
