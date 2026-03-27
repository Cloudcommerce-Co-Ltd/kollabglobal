// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQrPayment, QR_TTL_MS } from "@/hooks/use-qr-payment";

// ---------------------------------------------------------------------------
// Mock fetch globally
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useQrPayment", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with secondsRemaining = 900 (15 minutes)", () => {
    const { result } = renderHook(() =>
      useQrPayment({
        chargeId: "chrg_test",
        campaignId: "camp_1",
        onStatusChange: vi.fn(),
        onRecreate: vi.fn(),
      })
    );

    expect(result.current.secondsRemaining).toBe(QR_TTL_MS / 1000);
  });

  it("countdown ticks down every second", async () => {
    const { result } = renderHook(() =>
      useQrPayment({
        chargeId: "chrg_test",
        campaignId: "camp_1",
        onStatusChange: vi.fn(),
        onRecreate: vi.fn(),
      })
    );

    expect(result.current.secondsRemaining).toBe(QR_TTL_MS / 1000);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.secondsRemaining).toBeLessThanOrEqual(QR_TTL_MS / 1000 - 3);
  });

  it("calls onStatusChange('expired') when countdown reaches 0", async () => {
    const onStatusChange = vi.fn();

    renderHook(() =>
      useQrPayment({
        chargeId: "chrg_test",
        campaignId: "camp_1",
        onStatusChange,
        onRecreate: vi.fn(),
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(QR_TTL_MS + 1000);
    });

    expect(onStatusChange).toHaveBeenCalledWith("expired");
  });

  it("calls onStatusChange('completed') when poll returns successful", async () => {
    const onStatusChange = vi.fn();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: "successful" }),
    });

    renderHook(() =>
      useQrPayment({
        chargeId: "chrg_test",
        campaignId: "camp_1",
        onStatusChange,
        onRecreate: vi.fn(),
      })
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(onStatusChange).toHaveBeenCalledWith("completed");
  });

  it("calls onStatusChange('failed') when poll returns failed", async () => {
    const onStatusChange = vi.fn();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: "failed" }),
    });

    renderHook(() =>
      useQrPayment({
        chargeId: "chrg_test",
        campaignId: "camp_1",
        onStatusChange,
        onRecreate: vi.fn(),
      })
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(onStatusChange).toHaveBeenCalledWith("failed");
  });

  it("calls onStatusChange('expired') when poll returns expired (Omise expires before local countdown)", async () => {
    const onStatusChange = vi.fn();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: "expired" }),
    });

    renderHook(() =>
      useQrPayment({
        chargeId: "chrg_test",
        campaignId: "camp_1",
        onStatusChange,
        onRecreate: vi.fn(),
      })
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(onStatusChange).toHaveBeenCalledWith("expired");
    expect(onStatusChange).not.toHaveBeenCalledWith("failed");
  });

  it("stops polling after status becomes completed", async () => {
    const onStatusChange = vi.fn();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: "successful" }),
    });

    renderHook(() =>
      useQrPayment({
        chargeId: "chrg_test",
        campaignId: "camp_1",
        onStatusChange,
        onRecreate: vi.fn(),
      })
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(onStatusChange).toHaveBeenCalledWith("completed");

    const callCountAfterComplete = mockFetch.mock.calls.length;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000); // 3 more poll intervals
    });

    // fetch should NOT have been called again
    expect(mockFetch.mock.calls.length).toBe(callCountAfterComplete);
  });

  it("recreateQr resets timer and calls onRecreate with new data", async () => {
    const onStatusChange = vi.fn();
    const onRecreate = vi.fn();

    // All polling calls return "pending" (status never changes during the countdown)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: "pending" }),
    });

    const { result } = renderHook(() =>
      useQrPayment({
        chargeId: "chrg_old",
        campaignId: "camp_1",
        onStatusChange,
        onRecreate,
      })
    );

    // Expire the QR
    await act(async () => {
      await vi.advanceTimersByTimeAsync(QR_TTL_MS + 1000);
    });
    expect(onStatusChange).toHaveBeenCalledWith("expired");

    // Set up the resume endpoint mock
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        chargeId: "chrg_new",
        qrCodeUrl: "https://example.com/new-qr.png",
        chargeCreatedAt: Date.now(),
      }),
    });

    // Recreate
    await act(async () => {
      await result.current.recreateQr();
    });

    expect(onRecreate).toHaveBeenCalledWith(
      expect.objectContaining({
        chargeId: "chrg_new",
        qrCodeUrl: "https://example.com/new-qr.png",
        chargeCreatedAt: expect.any(Number),
      })
    );
    expect(onStatusChange).toHaveBeenCalledWith("pending");
    // Timer resets
    expect(result.current.secondsRemaining).toBe(QR_TTL_MS / 1000);
  });

  it("restores correct countdown when chargeCreatedAt arrives with chargeId (resume page pattern)", async () => {
    const onStatusChange = vi.fn();

    // Simulate chargeCreatedAt arriving at the same time as chargeId (after API call)
    // Charge was created halfway through TTL ago → half TTL should remain
    const chargeCreatedAt = Date.now() - QR_TTL_MS / 2;

    const { result, rerender } = renderHook(
      (props: { chargeId: string | null; chargeCreatedAt?: number | null }) =>
        useQrPayment({
          chargeId: props.chargeId,
          campaignId: "camp_1",
          chargeCreatedAt: props.chargeCreatedAt,
          onStatusChange,
          onRecreate: vi.fn(),
        }),
      { initialProps: { chargeId: null, chargeCreatedAt: null } }
    );

    // Initial state: no chargeId yet (loading)
    expect(result.current.secondsRemaining).toBe(QR_TTL_MS / 1000);

    // API returns: chargeId and chargeCreatedAt arrive together
    rerender({ chargeId: "chrg_resume", chargeCreatedAt });

    // Should show ~half TTL remaining, not full TTL
    const halfTtlSecs = QR_TTL_MS / 2 / 1000;
    expect(result.current.secondsRemaining).toBeGreaterThanOrEqual(halfTtlSecs - 5);
    expect(result.current.secondsRemaining).toBeLessThanOrEqual(halfTtlSecs + 5);
  });

  it("does nothing if chargeId is null", async () => {
    const onStatusChange = vi.fn();

    renderHook(() =>
      useQrPayment({
        chargeId: null,
        campaignId: "camp_1",
        onStatusChange,
        onRecreate: vi.fn(),
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(onStatusChange).not.toHaveBeenCalled();
  });
});
