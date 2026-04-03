// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("@base-ui/react/dialog", () => ({
  Dialog: {
    Root: ({ children }: { children: React.ReactNode }) => <div data-slot="dialog">{children}</div>,
    Trigger: ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => <button {...props}>{children}</button>,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Close: ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => <button data-slot="dialog-close" {...props}>{children}</button>,
    Backdrop: ({ children, className }: { children?: React.ReactNode; className?: string }) => <div data-slot="dialog-overlay" className={className}>{children}</div>,
    Popup: ({ children, className }: { children?: React.ReactNode; className?: string }) => <div data-slot="dialog-content" className={className}>{children}</div>,
    Title: ({ children, className }: { children?: React.ReactNode; className?: string }) => <h2 data-slot="dialog-title" className={className}>{children}</h2>,
    Description: ({ children, className }: { children?: React.ReactNode; className?: string }) => <p data-slot="dialog-description" className={className}>{children}</p>,
  },
}));

import { DialogContent, DialogFooter } from "../dialog";

describe("DialogContent", () => {
  it("renders close button by default", () => {
    render(
      <DialogContent>
        <span>Content</span>
      </DialogContent>
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("hides close button when showCloseButton=false", () => {
    render(
      <DialogContent showCloseButton={false}>
        <span>Content</span>
      </DialogContent>
    );
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });
});

describe("DialogFooter", () => {
  it("hides close button by default", () => {
    render(
      <DialogFooter>
        <span>Footer</span>
      </DialogFooter>
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders close button when showCloseButton=true", () => {
    render(
      <DialogFooter showCloseButton>
        <span>Footer</span>
      </DialogFooter>
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });
});
