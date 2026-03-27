import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../create-charge/route";
import { Prisma } from "@/generated/prisma/client";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    package: { findUnique: vi.fn() },
    campaign: { findFirst: vi.fn(), update: vi.fn() },
    campaignProduct: { create: vi.fn() },
    campaignCreator: { createMany: vi.fn() },
    payment: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/omise", () => ({
  isOmiseConfigured: vi.fn(),
  createPromptPayCharge: vi.fn(),
  retrieveCharge: vi.fn(),
}));

const makeRequest = (body: unknown, extraHeaders: Record<string, string> = {}) =>
  new Request("http://localhost/api/payments/create-charge", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });

const makeIdempotentRequest = (body: unknown, key = "test-idempotency-key") =>
  makeRequest(body, { "Idempotency-Key": key });

const validProductData = {
  brandName: "Test Brand",
  productName: "Test Product",
  category: "food",
  description: "A great product",
  sellingPoints: "Tasty and healthy",
  url: "https://example.com",
  imageUrl: "https://example.com/image.jpg",
  isService: false,
};

// No `amount` field — server computes it
const validBody = {
  countryId: 1,
  packageId: 2,
  promotionType: "PRODUCT",
  creatorIds: ["c1", "c2"],
  productData: validProductData,
};

// Package with numCreators=10, price=33250 (total) → vat=2328, fee=998 → total=36576 → satang=3657600
const mockPackage = {
  id: 2,
  numCreators: 10,
  price: 33250,
  name: "The Global Bridge",
  tagline: "ขยายฐาน",
  badge: null,
  platforms: [],
  deliverables: [],
  cpmLabel: null,
  cpmSavings: null,
  estReach: null,
  estEngagement: null,
};

const EXPECTED_SATANG = 3657600; // (33250 + 2328 + 998) * 100

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
    const req = makeRequest({ countryId: 1 }); // missing packageId, productData, etc.
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation error");
  });

  it("returns 400 when countryId or packageId are strings instead of numbers", async () => {
    const req = makeRequest({ ...validBody, countryId: "TH", packageId: "starter" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation error");
  });

  it("returns 400 when client-supplied amount field is sent (it is now ignored — schema strips unknown keys, but extra fields don't cause errors)", async () => {
    // Amount in body should be silently stripped; packageId still required
    const req = makeRequest({ ...validBody, amount: 1 });
    // Should NOT fail validation — `amount` is just an extra unknown key (zod strips it)
    // But it should still proceed normally, so we need auth/omise to be set up
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue(null);
    const res = await POST(req);
    expect(res.status).toBe(401); // fails on auth, not on amount field
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

  it("returns 400 when packageId not found in database", async () => {
    const { auth } = await import("@/auth");
    const prisma = (await import("@/lib/prisma")).default;

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_1", email: "test@example.com" },
      expires: "2026-12-31",
    });
    vi.mocked(prisma.package.findUnique).mockResolvedValue(null);

    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Package not found");
  });

  it("returns existing charge when AWAITING_PAYMENT campaign already exists (idempotency)", async () => {
    const { auth } = await import("@/auth");
    const prisma = (await import("@/lib/prisma")).default;
    const { retrieveCharge } = await import("@/lib/omise");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_1", email: "test@example.com" },
      expires: "2026-12-31",
    });
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as never);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue({
      id: "existing_campaign",
      userId: "user_1",
      payment: {
        id: "existing_payment",
        omiseChargeId: "chrg_existing",
        status: "PENDING" as never,
        amount: EXPECTED_SATANG,
        currency: "THB",
        method: "QR_CODE" as never,
        createdAt: new Date(),
        updatedAt: new Date(),
        campaignId: "existing_campaign",
      },
    } as never);
    vi.mocked(retrieveCharge).mockResolvedValue({
      chargeId: "chrg_existing",
      status: "pending",
      paid: false,
      amount: EXPECTED_SATANG,
      qrCodeUrl: "https://example.com/existing-qr.png",
    } as never);

    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.chargeId).toBe("chrg_existing");
    expect(data.qrCodeUrl).toBe("https://example.com/existing-qr.png");
    expect(data.campaignId).toBe("existing_campaign");
    // Should NOT create new campaign/payment
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("uses server-computed amount — ignores any client-supplied amount", async () => {
    const { auth } = await import("@/auth");
    const prisma = (await import("@/lib/prisma")).default;
    const { createPromptPayCharge } = await import("@/lib/omise");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_1", email: "test@example.com" },
      expires: "2026-12-31",
    });
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as never);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.$transaction).mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          campaign: { create: vi.fn().mockResolvedValue({ id: "campaign_1" }) },
          campaignProduct: { create: vi.fn().mockResolvedValue({}) },
          campaignCreator: { createMany: vi.fn().mockResolvedValue({}) },
          payment: { create: vi.fn().mockResolvedValue({ id: "payment_1", campaignId: "campaign_1" }) },
        };
        return cb(tx);
      }
    );
    vi.mocked(createPromptPayCharge).mockResolvedValue({
      chargeId: "chrg_test",
      qrCodeUrl: "https://example.com/qr.png",
      amount: EXPECTED_SATANG,
      status: "pending",
    });
    vi.mocked(prisma.payment.update).mockResolvedValue({} as never);

    // Client sends tampered amount of 1 satang — should be ignored
    const req = makeRequest({ ...validBody, amount: 1 });
    await POST(req);

    expect(createPromptPayCharge).toHaveBeenCalledWith(EXPECTED_SATANG);
  });

  it("returns 200 with chargeId, qrCodeUrl, paymentId, campaignId on success", async () => {
    const { auth } = await import("@/auth");
    const prisma = (await import("@/lib/prisma")).default;
    const { createPromptPayCharge } = await import("@/lib/omise");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_1", email: "test@example.com" },
      expires: "2026-12-31",
    });
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as never);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.$transaction).mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          campaign: { create: vi.fn().mockResolvedValue({ id: "campaign_1" }) },
          campaignProduct: { create: vi.fn().mockResolvedValue({}) },
          campaignCreator: { createMany: vi.fn().mockResolvedValue({}) },
          payment: { create: vi.fn().mockResolvedValue({ id: "payment_1", campaignId: "campaign_1" }) },
        };
        return cb(tx);
      }
    );
    vi.mocked(createPromptPayCharge).mockResolvedValue({
      chargeId: "chrg_test",
      qrCodeUrl: "https://example.com/qr.png",
      amount: EXPECTED_SATANG,
      status: "pending",
    });
    vi.mocked(prisma.payment.update).mockResolvedValue({} as never);

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

  it("creates Payment inside the transaction (not outside)", async () => {
    const { auth } = await import("@/auth");
    const prisma = (await import("@/lib/prisma")).default;
    const { createPromptPayCharge } = await import("@/lib/omise");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_1", email: "test@example.com" },
      expires: "2026-12-31",
    });
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as never);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);

    const txPaymentCreate = vi.fn().mockResolvedValue({ id: "payment_1", campaignId: "campaign_1" });
    vi.mocked(prisma.$transaction).mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          campaign: { create: vi.fn().mockResolvedValue({ id: "campaign_1" }) },
          campaignProduct: { create: vi.fn().mockResolvedValue({}) },
          campaignCreator: { createMany: vi.fn().mockResolvedValue({}) },
          payment: { create: txPaymentCreate },
        };
        return cb(tx);
      }
    );
    vi.mocked(createPromptPayCharge).mockResolvedValue({
      chargeId: "chrg_test",
      qrCodeUrl: "https://example.com/qr.png",
      amount: EXPECTED_SATANG,
      status: "pending",
    });
    vi.mocked(prisma.payment.update).mockResolvedValue({} as never);

    await POST(makeRequest(validBody));

    expect(txPaymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: EXPECTED_SATANG,
          status: "PENDING",
          omiseChargeId: null,
        }),
      })
    );
    // chargeCreatedAt is set on the subsequent payment.update (after Omise charge is created)
    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ chargeCreatedAt: expect.any(Date) }),
      })
    );
    // Standalone prisma.payment.create should NOT be called
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it("cancels campaign and fails payment when Omise call throws", async () => {
    const { auth } = await import("@/auth");
    const prisma = (await import("@/lib/prisma")).default;
    const { createPromptPayCharge } = await import("@/lib/omise");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_1", email: "test@example.com" },
      expires: "2026-12-31",
    });
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as never);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.$transaction)
      // First call: create transaction
      .mockImplementationOnce(async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          campaign: { create: vi.fn().mockResolvedValue({ id: "campaign_1" }) },
          campaignProduct: { create: vi.fn().mockResolvedValue({}) },
          campaignCreator: { createMany: vi.fn().mockResolvedValue({}) },
          payment: { create: vi.fn().mockResolvedValue({ id: "payment_1", campaignId: "campaign_1" }) },
        };
        return cb(tx);
      })
      // Second call: cleanup transaction
      .mockResolvedValueOnce([{}, {}]);

    vi.mocked(createPromptPayCharge).mockRejectedValue(new Error("Omise API error"));

    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe("Payment service error");

    // Cleanup transaction should have been called
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it("stores idempotencyKey on Payment.create when Idempotency-Key header is sent", async () => {
    const { auth } = await import("@/auth");
    const prisma = (await import("@/lib/prisma")).default;
    const { createPromptPayCharge } = await import("@/lib/omise");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_1", email: "test@example.com" },
      expires: "2026-12-31",
    });
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as never);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);

    const txPaymentCreate = vi.fn().mockResolvedValue({ id: "payment_1", campaignId: "campaign_1" });
    vi.mocked(prisma.$transaction).mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          campaign: { create: vi.fn().mockResolvedValue({ id: "campaign_1" }) },
          campaignProduct: { create: vi.fn().mockResolvedValue({}) },
          campaignCreator: { createMany: vi.fn().mockResolvedValue({}) },
          payment: { create: txPaymentCreate },
        };
        return cb(tx);
      }
    );
    vi.mocked(createPromptPayCharge).mockResolvedValue({
      chargeId: "chrg_test",
      qrCodeUrl: "https://example.com/qr.png",
      amount: EXPECTED_SATANG,
      status: "pending",
    });
    vi.mocked(prisma.payment.update).mockResolvedValue({} as never);

    await POST(makeIdempotentRequest(validBody, "uuid-abc-123"));

    expect(txPaymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ idempotencyKey: "uuid-abc-123" }),
      })
    );
  });

  it("returns existing charge when idempotency key conflict (P2002) and winner has chargeId", async () => {
    const { auth } = await import("@/auth");
    const prisma = (await import("@/lib/prisma")).default;
    const { retrieveCharge } = await import("@/lib/omise");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_1", email: "test@example.com" },
      expires: "2026-12-31",
    });
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as never);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);

    const p2002 = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed on the fields: (`idempotency_key`)",
      { code: "P2002", clientVersion: "7.0.0", meta: { target: ["idempotency_key"] } }
    );
    vi.mocked(prisma.$transaction).mockRejectedValue(p2002);

    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: "payment_winner",
      campaignId: "campaign_winner",
      omiseChargeId: "chrg_winner",
    } as never);
    vi.mocked(retrieveCharge).mockResolvedValue({
      chargeId: "chrg_winner",
      qrCodeUrl: "https://example.com/winner-qr.png",
      status: "pending",
      paid: false,
      amount: EXPECTED_SATANG,
    } as never);

    const res = await POST(makeIdempotentRequest(validBody, "dup-key"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.chargeId).toBe("chrg_winner");
    expect(data.qrCodeUrl).toBe("https://example.com/winner-qr.png");
    expect(data.campaignId).toBe("campaign_winner");
  });

  it("returns 409 when idempotency key conflict (P2002) and winner has not yet linked chargeId", async () => {
    const { auth } = await import("@/auth");
    const prisma = (await import("@/lib/prisma")).default;

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_1", email: "test@example.com" },
      expires: "2026-12-31",
    });
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as never);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);

    const p2002 = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed on the fields: (`idempotency_key`)",
      { code: "P2002", clientVersion: "7.0.0", meta: { target: ["idempotency_key"] } }
    );
    vi.mocked(prisma.$transaction).mockRejectedValue(p2002);

    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: "payment_winner",
      campaignId: "campaign_winner",
      omiseChargeId: null, // winner hasn't linked yet
    } as never);

    const res = await POST(makeIdempotentRequest(validBody, "dup-key"));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBe("Payment in progress, retry in a moment");
  });

  it("passes real product data to campaignProduct.create in transaction", async () => {
    const { auth } = await import("@/auth");
    const prisma = (await import("@/lib/prisma")).default;
    const { createPromptPayCharge } = await import("@/lib/omise");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user_1", email: "test@example.com" },
      expires: "2026-12-31",
    });
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as never);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);

    const campaignProductCreate = vi.fn().mockResolvedValue({});
    vi.mocked(prisma.$transaction).mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          campaign: { create: vi.fn().mockResolvedValue({ id: "campaign_1" }) },
          campaignProduct: { create: campaignProductCreate },
          campaignCreator: { createMany: vi.fn().mockResolvedValue({}) },
          payment: { create: vi.fn().mockResolvedValue({ id: "payment_1", campaignId: "campaign_1" }) },
        };
        return cb(tx);
      }
    );
    vi.mocked(createPromptPayCharge).mockResolvedValue({
      chargeId: "chrg_test",
      qrCodeUrl: "https://example.com/qr.png",
      amount: EXPECTED_SATANG,
      status: "pending",
    });
    vi.mocked(prisma.payment.update).mockResolvedValue({} as never);

    await POST(makeRequest(validBody));

    expect(campaignProductCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        brandName: "Test Brand",
        productName: "Test Product",
        category: "food",
        description: "A great product",
        sellingPoints: "Tasty and healthy",
        isService: false,
      }),
    });
  });
});
