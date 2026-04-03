// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CampaignIcon } from "../campaign-icon";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

describe("CampaignIcon", () => {
  it("renders fallback letter when no product", () => {
    render(<CampaignIcon />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("renders first letter of productName when no imageUrl", () => {
    render(<CampaignIcon product={{ productName: "Banana", imageUrl: null }} />);
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renders image when imageUrl is provided", () => {
    render(<CampaignIcon product={{ productName: "Cake", imageUrl: "https://cdn.example.com/cake.jpg" }} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://cdn.example.com/cake.jpg");
    expect(img).toHaveAttribute("alt", "Cake");
  });

  it("applies size classes for lg", () => {
    const { container } = render(
      <CampaignIcon product={{ productName: "Drink", imageUrl: null }} size="lg" />
    );
    expect(container.firstChild).toHaveClass("size-[72px]");
  });
});
