import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../[chargeId]/status/route";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    payment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    campaign: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/omise", () => ({
  isOmiseConfigured: vi.fn(),
  retrieveCharge: vi.fn(),
}));

const makeRequest = (chargeId: string) => ({
  request: new Request(`http://localhost/api/payments/${chargeId}/status`),
  params: Promise.resolve({ chargeId }),
});

const mockSession = {
  user: { id: "user_1", email: "test@example.com" },
  expires: "2026-12-31",
};

const STALE_DATE = new Date(Date.now() - 60_000);   // 60s ago — stale
const FRESH_DATE = new Date(Date.now() - 5_000);    // 5s ago — fresh

describe("GET /api/payments/[chargeId]/status", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const { isOmiseConfigured } = await import("@/lib/omise");
    vi.mocked(isOmiseConfigured).mockReturnValue(false);
  });

  it("returns 401 when no session", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue(null as never);

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
    vi.mocked(prisma.payment.findUnique).mockResolvedValue(null);

    const { request, params } = makeRequest("chrg_unknown");
    const res = await GET(request, { params });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Payment not found");
  });

  it("returns 404 when payment belongs to a different user", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      status: "PENDING" as never,
      amount: 100000,
      campaignId: "campaign_1",
      createdAt: STALE_DATE,
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
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      status: "PENDING" as never,
      amount: 100000,
      campaignId: "campaign_1",
      createdAt: FRESH_DATE,
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
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      status: "COMPLETED" as never,
      amount: 100000,
      campaignId: "campaign_1",
      createdAt: STALE_DATE,
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
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      status: "FAILED" as never,
      amount: 100000,
      campaignId: "campaign_1",
      createdAt: STALE_DATE,
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
    vi.mocked(prisma.payment.findUnique).mockRejectedValue(new Error("DB error"));

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Internal server error");
  });

  // ---------------------------------------------------------------------------
  // Omise fallback tests — stale PENDING payments
  // ---------------------------------------------------------------------------

  it("does NOT call Omise when payment is fresh (<30s old)", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { isOmiseConfigured, retrieveCharge } = await import("@/lib/omise");

    vi.mocked(isOmiseConfigured).mockReturnValue(true);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      status: "PENDING" as never,
      amount: 100000,
      campaignId: "campaign_1",
      createdAt: FRESH_DATE,
      userId: "user_1",
    } as never);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("pending");
    expect(retrieveCharge).not.toHaveBeenCalled();
  });

  it("does NOT call Omise when Omise is not configured", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { isOmiseConfigured, retrieveCharge } = await import("@/lib/omise");

    vi.mocked(isOmiseConfigured).mockReturnValue(false);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      status: "PENDING" as never,
      amount: 100000,
      campaignId: "campaign_1",
      createdAt: STALE_DATE,
      userId: "user_1",
    } as never);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("pending");
    expect(retrieveCharge).not.toHaveBeenCalled();
  });

  it("returns successful and updates payment+campaign when Omise says successful (stale PENDING)", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { isOmiseConfigured, retrieveCharge } = await import("@/lib/omise");

    vi.mocked(isOmiseConfigured).mockReturnValue(true);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      status: "PENDING" as never,
      amount: 100000,
      campaignId: "campaign_1",
      createdAt: STALE_DATE,
      userId: "user_1",
    } as never);
    vi.mocked(retrieveCharge).mockResolvedValue({ status: "successful", paid: true, amount: 100000, qrCodeUrl: "" } as never);
    vi.mocked(prisma.$transaction).mockImplementation(((async (fn: (tx: unknown) => Promise<unknown>) => fn(prisma as never)) as never));
    vi.mocked(prisma.payment.update).mockResolvedValue({} as never);
    vi.mocked(prisma.campaign.update).mockResolvedValue({} as never);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ status: "successful", paid: true, amount: 100000 });

    expect(retrieveCharge).toHaveBeenCalledWith("chrg_test_123");
    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "COMPLETED" } })
    );
    expect(prisma.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "PENDING" } })
    );
  });

  it("returns failed and updates payment when Omise says failed (stale PENDING)", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { isOmiseConfigured, retrieveCharge } = await import("@/lib/omise");

    vi.mocked(isOmiseConfigured).mockReturnValue(true);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      status: "PENDING" as never,
      amount: 100000,
      campaignId: "campaign_1",
      createdAt: STALE_DATE,
      userId: "user_1",
    } as never);
    vi.mocked(retrieveCharge).mockResolvedValue({ status: "failed", paid: false, amount: 100000, qrCodeUrl: "" } as never);
    vi.mocked(prisma.payment.update).mockResolvedValue({} as never);
    vi.mocked(prisma.campaign.update).mockResolvedValue({} as never);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ status: "failed", paid: false, amount: 100000 });
  });

  it("returns failed and updates payment when Omise says expired (stale PENDING)", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { isOmiseConfigured, retrieveCharge } = await import("@/lib/omise");

    vi.mocked(isOmiseConfigured).mockReturnValue(true);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      status: "PENDING" as never,
      amount: 100000,
      campaignId: "campaign_1",
      createdAt: STALE_DATE,
      userId: "user_1",
    } as never);
    vi.mocked(retrieveCharge).mockResolvedValue({ status: "expired", paid: false, amount: 100000, qrCodeUrl: "" } as never);
    vi.mocked(prisma.payment.update).mockResolvedValue({} as never);
    vi.mocked(prisma.campaign.update).mockResolvedValue({} as never);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ status: "failed", paid: false, amount: 100000 });
  });

  it("returns pending (DB status) when Omise call throws (silent fallback)", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { isOmiseConfigured, retrieveCharge } = await import("@/lib/omise");

    vi.mocked(isOmiseConfigured).mockReturnValue(true);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      status: "PENDING" as never,
      amount: 100000,
      campaignId: "campaign_1",
      createdAt: STALE_DATE,
      userId: "user_1",
    } as never);
    vi.mocked(retrieveCharge).mockRejectedValue(new Error("Omise API error"));

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("pending");
  });
});
