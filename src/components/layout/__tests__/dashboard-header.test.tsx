// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DashboardHeader } from "../dashboard-header";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));
vi.mock("../../../../public/images/Logo-Name.webp", () => ({ default: "/logo.webp" }));

import { signOut } from "next-auth/react";

describe("DashboardHeader", () => {
  it("renders user name", () => {
    render(<DashboardHeader user={{ id: "u1", name: "Alice", email: "a@b.com", image: null }} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders avatar image when provided", () => {
    render(<DashboardHeader user={{ id: "u1", name: "Bob", email: "b@b.com", image: "https://cdn/av.png" }} />);
    const avatars = screen.getAllByRole("img");
    expect(avatars.some(img => img.getAttribute("src") === "https://cdn/av.png")).toBe(true);
  });

  it("renders fallback emoji when no image", () => {
    render(<DashboardHeader user={{ id: "u1", name: "Carol", email: "c@b.com", image: null }} />);
    expect(screen.getByText("👤")).toBeInTheDocument();
  });

  it("calls signOut on logout click", () => {
    render(<DashboardHeader user={{ id: "u1", name: "Dave", email: "d@b.com", image: null }} />);
    fireEvent.click(screen.getByLabelText("ออกจากระบบ"));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("uses User as alt text when name is null", () => {
    render(<DashboardHeader user={{ id: "u1", name: null, email: "e@b.com", image: "https://cdn/av.png" }} />);
    const avatars = screen.getAllByRole("img");
    const avatar = avatars.find(img => img.getAttribute("src") === "https://cdn/av.png");
    expect(avatar).toHaveAttribute("alt", "User");
  });

  it("renders new campaign link", () => {
    render(<DashboardHeader user={{ id: "u1", name: "Eve", email: "e@b.com", image: null }} />);
    const link = screen.getByRole("link", { name: /แคมเปญใหม่/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("/campaigns/new/country"));
  });
});
