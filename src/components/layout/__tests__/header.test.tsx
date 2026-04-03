// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Header } from "../header";

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

describe("Header", () => {
  it("renders user name", () => {
    render(<Header user={{ id: "u1", name: "Alice", email: "a@b.com", image: null }} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders user avatar image when user.image is set", () => {
    render(<Header user={{ id: "u1", name: "Bob", email: "b@b.com", image: "https://cdn/avatar.png" }} />);
    const avatars = screen.getAllByRole("img");
    const avatar = avatars.find(img => img.getAttribute("src") === "https://cdn/avatar.png");
    expect(avatar).toBeInTheDocument();
  });

  it("renders fallback emoji when user.image is null", () => {
    render(<Header user={{ id: "u1", name: "Carol", email: "c@b.com", image: null }} />);
    expect(screen.getByText("👤")).toBeInTheDocument();
  });

  it("calls signOut when logout button is clicked", () => {
    render(<Header user={{ id: "u1", name: "Dave", email: "d@b.com", image: null }} />);
    fireEvent.click(screen.getByLabelText("ออกจากระบบ"));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("uses User as alt text when name is null", () => {
    render(<Header user={{ id: "u1", name: null, email: "e@b.com", image: "https://cdn/av.png" }} />);
    const avatars = screen.getAllByRole("img");
    const avatar = avatars.find(img => img.getAttribute("src") === "https://cdn/av.png");
    expect(avatar).toHaveAttribute("alt", "User");
  });
});
