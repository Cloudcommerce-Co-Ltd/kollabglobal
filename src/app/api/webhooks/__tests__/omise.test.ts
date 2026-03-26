import { createHmac } from "crypto";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../omise/route";

// Mock the payment queue and redis to prevent real connections
vi.mock("@/lib/queue/payment-queue", () => ({
  paymentQueue: {
    add: vi.fn(),
  },
  PAYMENT_EVENTS_QUEUE: "payment-events",
}));

vi.mock("@/lib/redis", () => ({
  default: {
    on: vi.fn(),
    quit: vi.fn(),
  },
  isRedisConfigured: vi.fn().mockReturnValue(false),
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

  it("returns 200 for non-charge.complete events without calling queue", async () => {
    const { paymentQueue } = await import("@/lib/queue/payment-queue");
    const req = makeWebhookRequest({ key: "charge.create", data: { id: "chrg_test_123" } });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ received: true });
    expect(paymentQueue.add).not.toHaveBeenCalled();
  });

  it("returns 200 without calling queue when chargeId is missing", async () => {
    const { paymentQueue } = await import("@/lib/queue/payment-queue");
    const req = makeWebhookRequest({
      key: "charge.complete",
      data: { status: "successful" }, // no id
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ received: true });
    expect(paymentQueue.add).not.toHaveBeenCalled();
  });

  it("calls paymentQueue.add with correct job data on valid charge.complete", async () => {
    const { paymentQueue } = await import("@/lib/queue/payment-queue");
    vi.mocked(paymentQueue.add).mockResolvedValue({} as never);

    const req = makeWebhookRequest({
      key: "charge.complete",
      data: { id: "chrg_test_123", status: "successful" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ received: true });

    expect(paymentQueue.add).toHaveBeenCalledWith(
      "charge-chrg_test_123",
      expect.objectContaining({
        chargeId: "chrg_test_123",
        chargeStatus: "successful",
        omiseEventKey: "charge.complete",
      }),
      { jobId: "charge-complete-chrg_test_123" },
    );
  });

  it("uses 'unknown' chargeStatus when charge.complete data has no status", async () => {
    const { paymentQueue } = await import("@/lib/queue/payment-queue");
    vi.mocked(paymentQueue.add).mockResolvedValue({} as never);

    const req = makeWebhookRequest({
      key: "charge.complete",
      data: { id: "chrg_test_456" }, // no status field
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(paymentQueue.add).toHaveBeenCalledWith(
      "charge-chrg_test_456",
      expect.objectContaining({
        chargeId: "chrg_test_456",
        chargeStatus: "unknown",
      }),
      { jobId: "charge-complete-chrg_test_456" },
    );
  });

  it("returns 503 when Redis/queue is unavailable (queue.add throws)", async () => {
    const { paymentQueue } = await import("@/lib/queue/payment-queue");
    vi.mocked(paymentQueue.add).mockRejectedValue(new Error("Redis connection refused"));

    const req = makeWebhookRequest({
      key: "charge.complete",
      data: { id: "chrg_test_789", status: "successful" },
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toBe("Service unavailable");
  });
});
