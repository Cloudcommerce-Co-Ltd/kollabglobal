import { createHmac } from "crypto";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

// Secret must be base64-encoded (as Omise stores it) — decoded bytes are used as HMAC key
const WEBHOOK_SECRET_BASE64 = Buffer.from("test_webhook_secret").toString("base64");
// A recent timestamp: within 5 minutes of "now" — tests stub Date.now to this value
const FIXED_NOW_MS = 1700000300000; // ms
const TEST_TIMESTAMP = "1700000000"; // 300 seconds before FIXED_NOW — just inside the 5-min window

function sign(timestamp: string, body: string): string {
  const secretBytes = Buffer.from(WEBHOOK_SECRET_BASE64, "base64");
  return createHmac("sha256", secretBytes).update(`${timestamp}.${body}`).digest("hex");
}

const makeWebhookRequest = (body: unknown) => {
  const rawBody = JSON.stringify(body);
  return new Request("http://localhost/api/webhooks/omise", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "omise-signature": sign(TEST_TIMESTAMP, rawBody),
      "omise-signature-timestamp": TEST_TIMESTAMP,
    },
    body: rawBody,
  });
};

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
    vi.stubEnv("OMISE_WEBHOOK_SECRET", WEBHOOK_SECRET_BASE64);
    vi.spyOn(Date, "now").mockReturnValue(FIXED_NOW_MS);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 401 when signature headers are missing", async () => {
    const req = new Request("http://localhost/api/webhooks/omise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "charge.complete" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Invalid signature");
  });

  it("returns 401 when signature is wrong", async () => {
    const req = new Request("http://localhost/api/webhooks/omise", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "omise-signature": "wrong_signature",
        "omise-signature-timestamp": TEST_TIMESTAMP,
      },
      body: JSON.stringify({ key: "charge.complete" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
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

  it("updates payment to COMPLETED and campaign to PENDING on charge.complete with status: successful", async () => {
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

  it("updates payment to FAILED and campaign to CANCELLED on charge.complete with status: failed", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue(mockPayment);
    vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}]);

    const req = makeWebhookRequest({
      key: "charge.complete",
      data: { id: "chrg_test_123", status: "failed" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalled();
    const data = await res.json();
    expect(data).toEqual({ received: true });
  });

  it("updates payment to FAILED and campaign to CANCELLED on charge.complete with status: expired", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue(mockPayment);
    vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}]);

    const req = makeWebhookRequest({
      key: "charge.complete",
      data: { id: "chrg_test_123", status: "expired" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalled();
    const data = await res.json();
    expect(data).toEqual({ received: true });
  });

  it("returns 401 when webhook timestamp is older than 5 minutes", async () => {
    // 600 seconds old — well outside the 5-min window
    const oldTimestamp = String(Math.floor(FIXED_NOW_MS / 1000) - 600);
    const body = JSON.stringify({ key: "charge.create" });
    const req = new Request("http://localhost/api/webhooks/omise", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "omise-signature": sign(oldTimestamp, body),
        "omise-signature-timestamp": oldTimestamp,
      },
      body,
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Webhook too old");
  });

  it("accepts webhook with a recent timestamp (within 5 minutes)", async () => {
    // Exactly at the boundary — TEST_TIMESTAMP is exactly 300s before FIXED_NOW_MS
    const req = makeWebhookRequest({ key: "charge.create", data: { id: "chrg_test_123" } });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("returns 200 without updating when payment is already COMPLETED (state guard)", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue({
      ...mockPayment,
      status: "COMPLETED" as never,
    });

    const req = makeWebhookRequest({
      key: "charge.complete",
      data: { id: "chrg_test_123", status: "failed" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    // Transaction should NOT be called — payment already settled
    expect(prisma.$transaction).not.toHaveBeenCalled();
    const data = await res.json();
    expect(data).toEqual({ received: true });
  });

  it("returns 200 without updating when payment is already FAILED (state guard)", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.payment.findFirst).mockResolvedValue({
      ...mockPayment,
      status: "FAILED" as never,
    });

    const req = makeWebhookRequest({
      key: "charge.complete",
      data: { id: "chrg_test_123", status: "successful" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    const data = await res.json();
    expect(data).toEqual({ received: true });
  });

  it("returns 400 on invalid JSON (with valid signature)", async () => {
    const rawBody = "not-valid-json{{{";
    const req = new Request("http://localhost/api/webhooks/omise", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "omise-signature": sign(TEST_TIMESTAMP, rawBody),
        "omise-signature-timestamp": TEST_TIMESTAMP,
      },
      body: rawBody,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON");
  });
});
