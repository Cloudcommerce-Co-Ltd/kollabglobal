import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../omise/route";

vi.mock("@/lib/prisma", () => ({
  default: {
    payment: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    campaign: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const makeWebhookRequest = (body: unknown) =>
  new Request("http://localhost/api/webhooks/omise", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockPayment = {
  id: "payment_1",
  campaignId: "campaign_1",
  omiseChargeId: "chrg_test_123",
  amount: 100000,
  currency: "THB",
  method: "QR_CODE" as never,
  status: "PENDING" as never,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("POST /api/webhooks/omise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 for non-charge.complete events (ignores them)", async () => {
    const req = makeWebhookRequest({ key: "charge.create", data: { id: "chrg_test_123" } });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ received: true });
  });

  it("returns 200 (idempotent) when no payment found for chargeId", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue(null);

    const req = makeWebhookRequest({
      key: "charge.complete",
      data: { id: "chrg_unknown", status: "successful" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ received: true });
  });

  it("updates payment to COMPLETED and campaign to ACTIVE on charge.complete with status: successful", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue(mockPayment);
    vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}]);

    const req = makeWebhookRequest({
      key: "charge.complete",
      data: { id: "chrg_test_123", status: "successful" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalled();
    const data = await res.json();
    expect(data).toEqual({ received: true });
  });

  it("updates payment to FAILED on charge.complete with status: failed", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue(mockPayment);
    vi.mocked(prisma.payment.update).mockResolvedValue({ ...mockPayment, status: "FAILED" as never });

    const req = makeWebhookRequest({
      key: "charge.complete",
      data: { id: "chrg_test_123", status: "failed" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: "payment_1" },
      data: { status: "FAILED" },
    });
    const data = await res.json();
    expect(data).toEqual({ received: true });
  });

  it("returns 400 on invalid JSON", async () => {
    const req = new Request("http://localhost/api/webhooks/omise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-valid-json{{{",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON");
  });
});
