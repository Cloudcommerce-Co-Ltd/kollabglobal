import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../create-charge/route";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    user: { findUnique: vi.fn() },
    campaign: { create: vi.fn() },
    campaignProduct: { create: vi.fn() },
    campaignCreator: { createMany: vi.fn() },
    payment: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/omise", () => ({
  isOmiseConfigured: vi.fn(),
  createPromptPayCharge: vi.fn(),
}));

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/payments/create-charge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = {
  amount: 100000,
  countryId: "TH",
  packageId: "starter",
  promotionType: "PRODUCT",
  creatorIds: ["c1", "c2"],
};

describe("POST /api/payments/create-charge", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { isOmiseConfigured } = await import("@/lib/omise");
    vi.mocked(isOmiseConfigured).mockReturnValue(true);
  });

  it("returns 400 on invalid JSON body", async () => {
    const req = new Request("http://localhost/api/payments/create-charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-valid-json{{{",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns 400 on missing required fields (Zod validation)", async () => {
    const req = makeRequest({ amount: 100000 }); // missing countryId, packageId, etc.
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation error");
  });

  it("returns 503 when Omise is not configured", async () => {
    const { isOmiseConfigured } = await import("@/lib/omise");
    vi.mocked(isOmiseConfigured).mockReturnValue(false);

    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toBe("Payment service is not configured");
  });

  it("returns 401 when no session", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue(null);

    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 200 with chargeId, qrCodeUrl, paymentId, campaignId on success", async () => {
    const { auth } = await import("@/auth");
    const prisma = (await import("@/lib/prisma")).default;
    const { createPromptPayCharge } = await import("@/lib/omise");

    vi.mocked(auth).mockResolvedValue({
      user: { email: "test@example.com" },
      expires: "2026-12-31",
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      name: null,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(prisma.$transaction).mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          campaign: {
            create: vi.fn().mockResolvedValue({ id: "campaign_1" }),
          },
          campaignProduct: { create: vi.fn().mockResolvedValue({}) },
          campaignCreator: { createMany: vi.fn().mockResolvedValue({}) },
        };
        return cb(tx);
      }
    );

    vi.mocked(createPromptPayCharge).mockResolvedValue({
      chargeId: "chrg_test",
      qrCodeUrl: "https://example.com/qr.png",
      amount: 100000,
      status: "pending",
    });

    vi.mocked(prisma.payment.create).mockResolvedValue({
      id: "payment_1",
      campaignId: "campaign_1",
      amount: 100000,
      currency: "THB",
      method: "QR_CODE" as never,
      status: "PENDING" as never,
      omiseChargeId: "chrg_test",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      chargeId: "chrg_test",
      qrCodeUrl: "https://example.com/qr.png",
      paymentId: "payment_1",
      campaignId: "campaign_1",
    });
  });
});
