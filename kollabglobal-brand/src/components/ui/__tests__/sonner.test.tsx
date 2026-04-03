// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => ({ theme: "light" })),
}));

vi.mock("sonner", () => ({
  Toaster: ({ theme, className }: { theme?: string; className?: string }) => (
    <div data-testid="toaster" data-theme={theme} className={className} />
  ),
}));

import { Toaster } from "../sonner";
import { useTheme } from "next-themes";

describe("Toaster", () => {
  it("renders with light theme by default", () => {
    vi.mocked(useTheme).mockReturnValue({ theme: "light", setTheme: vi.fn(), themes: [], resolvedTheme: "light", systemTheme: "light", forcedTheme: undefined });
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId("toaster")).toHaveAttribute("data-theme", "light");
  });

  it("renders with dark theme when useTheme returns dark", () => {
    vi.mocked(useTheme).mockReturnValue({ theme: "dark", setTheme: vi.fn(), themes: [], resolvedTheme: "dark", systemTheme: "dark", forcedTheme: undefined });
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId("toaster")).toHaveAttribute("data-theme", "dark");
  });

  it("falls back to light when theme is undefined", () => {
    vi.mocked(useTheme).mockReturnValue({ theme: undefined, setTheme: vi.fn(), themes: [], resolvedTheme: undefined, systemTheme: undefined, forcedTheme: undefined });
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId("toaster")).toHaveAttribute("data-theme", "light");
  });
});
