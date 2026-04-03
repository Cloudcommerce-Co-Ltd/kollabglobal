import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/queue/payment-queue", () => ({
  paymentQueue: {
    getWaitingCount: vi.fn().mockResolvedValue(0),
    getActiveCount: vi.fn().mockResolvedValue(0),
    getCompletedCount: vi.fn().mockResolvedValue(5),
    getFailedCount: vi.fn().mockResolvedValue(1),
    getDelayedCount: vi.fn().mockResolvedValue(0),
    getFailed: vi.fn().mockResolvedValue([]),
  },
}));

import { GET } from "../route";

describe("GET /api/admin/queues", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(null as never);

    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns queue stats when authenticated", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1" }, expires: "" } as never);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.queue).toBe("payment-events");
    expect(data.counts).toMatchObject({ waiting: 0, active: 0, completed: 5, failed: 1, delayed: 0 });
    expect(data.recentFailed).toEqual([]);
  });

  it("returns 500 when queue throws", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1" }, expires: "" } as never);
    const { paymentQueue } = await import("@/lib/queue/payment-queue");
    vi.mocked(paymentQueue.getWaitingCount).mockRejectedValueOnce(new Error("Redis down"));

    const res = await GET();
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Failed to fetch queue stats");
  });
});
