import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../[chargeId]/status/route";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    payment: { findFirst: vi.fn() },
  },
}));

const makeRequest = (chargeId: string) => ({
  request: new Request(`http://localhost/api/payments/${chargeId}/status`),
  params: Promise.resolve({ chargeId }),
});

const mockSession = {
  user: { id: "user_1", email: "test@example.com" },
  expires: "2026-12-31",
};

describe("GET /api/payments/[chargeId]/status", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue(mockSession as never);
  });

  it("returns 401 when no session", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue(null);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 401 when session has no user.id", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue({ user: {}, expires: "2026-12-31" } as never);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when no payment found for chargeId", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue(null);

    const { request, params } = makeRequest("chrg_unknown");
    const res = await GET(request, { params });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Payment not found");
  });

  it("returns 404 when payment belongs to a different user", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue({
      status: "PENDING" as never,
      amount: 100000,
      userId: "other_user",
    } as never);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Payment not found");
  });

  it("returns status=pending, paid=false for PENDING payment", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue({
      status: "PENDING" as never,
      amount: 100000,
      userId: "user_1",
    } as never);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ status: "pending", paid: false, amount: 100000 });
  });

  it("returns status=successful, paid=true for COMPLETED payment", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue({
      status: "COMPLETED" as never,
      amount: 100000,
      userId: "user_1",
    } as never);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ status: "successful", paid: true, amount: 100000 });
  });

  it("returns status=failed, paid=false for FAILED payment", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue({
      status: "FAILED" as never,
      amount: 100000,
      userId: "user_1",
    } as never);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ status: "failed", paid: false, amount: 100000 });
  });

  it("returns 500 on DB error", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockRejectedValue(new Error("DB error"));

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Internal server error");
  });
});
