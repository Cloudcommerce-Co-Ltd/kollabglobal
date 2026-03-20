// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useScrollToRef } from "@/hooks/use-scroll-to-ref";

// jsdom environment needed for scroll tests — skip if running in node
describe("useScrollToRef", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not scroll when condition is false", () => {
    const scrollIntoView = vi.fn();
    renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      // Attach a mock element
      ref.current = { scrollIntoView } as unknown as HTMLDivElement;
      useScrollToRef(ref, false);
      return ref;
    });

    vi.runAllTimers();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("scrolls when condition becomes true", () => {
    const scrollIntoView = vi.fn();
    const { rerender } = renderHook(
      ({ condition }: { condition: boolean }) => {
        const ref = useRef<HTMLDivElement | null>(null);
        ref.current = { scrollIntoView } as unknown as HTMLDivElement;
        useScrollToRef(ref, condition);
        return ref;
      },
      { initialProps: { condition: false } }
    );

    expect(scrollIntoView).not.toHaveBeenCalled();

    rerender({ condition: true });
    vi.runAllTimers();

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
  });

  it("only fires once with once=true (default)", () => {
    const scrollIntoView = vi.fn();
    const { rerender } = renderHook(
      ({ condition }: { condition: boolean }) => {
        const ref = useRef<HTMLDivElement | null>(null);
        ref.current = { scrollIntoView } as unknown as HTMLDivElement;
        useScrollToRef(ref, condition);
        return ref;
      },
      { initialProps: { condition: false } }
    );

    rerender({ condition: true });
    vi.runAllTimers();
    rerender({ condition: false });
    rerender({ condition: true });
    vi.runAllTimers();

    // Should only have scrolled once
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });
});
