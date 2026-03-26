import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  default: {
    campaign: { findFirst: vi.fn() },
    payment: { update: vi.fn() },
  },
}));

vi.mock("@/lib/omise", () => ({
  isOmiseConfigured: vi.fn(),
  retrieveCharge: vi.fn(),
  createPromptPayCharge: vi.fn(),
}));

const makeRequest = (campaignId: string) => ({
  request: new Request(`http://localhost/api/payments/resume/${campaignId}`),
  params: Promise.resolve({ campaignId }),
});

const mockSession = { user: { id: "user_1" }, expires: "2026-12-31" };

const mockCampaign = {
  id: "campaign_1",
  userId: "user_1",
  status: "AWAITING_PAYMENT",
  package: { id: 1, name: "Starter", numCreators: 3, price: 5000, deliverables: ["Instagram Post"] },
  product: { brandName: "TestBrand", productName: "TestProduct", isService: false, category: "Fashion" },
  creators: [
    { creator: { id: "c1", name: "Alice", avatar: null } },
    { creator: { id: "c2", name: "Bob", avatar: null } },
  ],
  payment: {
    id: "pay_1",
    omiseChargeId: "chrg_test_123",
    createdAt: new Date(Date.now() - 60_000), // stale
  },
};

describe("GET /api/payments/resume/[campaignId]", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    const { isOmiseConfigured } = await import("@/lib/omise");
    vi.mocked(isOmiseConfigured).mockReturnValue(true);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue(null);

    const { request, params } = makeRequest("campaign_1");
    const res = await GET(request, { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when campaign not found or not owned by user", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);

    const { request, params } = makeRequest("campaign_1");
    const res = await GET(request, { params });
    expect(res.status).toBe(404);
  });

  it("returns 409 when campaign is not AWAITING_PAYMENT", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue({
      ...mockCampaign,
      status: "PENDING",
    } as never);

    const { request, params } = makeRequest("campaign_1");
    const res = await GET(request, { params });
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBe("Campaign is not awaiting payment");
  });

  it("returns 503 when Omise is not configured", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { isOmiseConfigured } = await import("@/lib/omise");
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign as never);
    vi.mocked(isOmiseConfigured).mockReturnValue(false);

    const { request, params } = makeRequest("campaign_1");
    const res = await GET(request, { params });
    expect(res.status).toBe(503);
  });

  it("returns existing chargeId and qrCodeUrl when Omise charge is still pending", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { retrieveCharge } = await import("@/lib/omise");
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign as never);
    vi.mocked(retrieveCharge).mockResolvedValue({ status: "pending", paid: false, amount: 500000, qrCodeUrl: "https://qr.example.com/qr.png" } as never);

    const { request, params } = makeRequest("campaign_1");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.chargeId).toBe("chrg_test_123");
    expect(data.qrCodeUrl).toBe("https://qr.example.com/qr.png");
    expect(data.campaignId).toBe("campaign_1");
  });

  it("creates a new charge when existing Omise charge is expired", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { retrieveCharge, createPromptPayCharge } = await import("@/lib/omise");
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign as never);
    vi.mocked(retrieveCharge).mockResolvedValue({ status: "expired", paid: false, amount: 0, qrCodeUrl: "" } as never);
    vi.mocked(createPromptPayCharge).mockResolvedValue({ chargeId: "chrg_new_456", qrCodeUrl: "https://qr.example.com/new.png", amount: 500000, status: "pending" });
    vi.mocked(prisma.payment.update).mockResolvedValue({} as never);

    const { request, params } = makeRequest("campaign_1");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.chargeId).toBe("chrg_new_456");
    expect(data.qrCodeUrl).toBe("https://qr.example.com/new.png");
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: "pay_1" },
      data: { omiseChargeId: "chrg_new_456" },
    });
  });

  it("creates a new charge when retrieveCharge throws (charge not found)", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { retrieveCharge, createPromptPayCharge } = await import("@/lib/omise");
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign as never);
    vi.mocked(retrieveCharge).mockRejectedValue(new Error("Charge not found"));
    vi.mocked(createPromptPayCharge).mockResolvedValue({ chargeId: "chrg_new_789", qrCodeUrl: "https://qr.example.com/new2.png", amount: 500000, status: "pending" });
    vi.mocked(prisma.payment.update).mockResolvedValue({} as never);

    const { request, params } = makeRequest("campaign_1");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.chargeId).toBe("chrg_new_789");
  });

  it("creates a new charge when payment has no omiseChargeId", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { createPromptPayCharge } = await import("@/lib/omise");
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue({
      ...mockCampaign,
      payment: { id: "pay_1", omiseChargeId: null, createdAt: new Date() },
    } as never);
    vi.mocked(createPromptPayCharge).mockResolvedValue({ chargeId: "chrg_fresh_111", qrCodeUrl: "https://qr.example.com/fresh.png", amount: 500000, status: "pending" });
    vi.mocked(prisma.payment.update).mockResolvedValue({} as never);

    const { request, params } = makeRequest("campaign_1");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.chargeId).toBe("chrg_fresh_111");
  });

  it("response includes package, product, and creators for display", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    const { retrieveCharge } = await import("@/lib/omise");
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign as never);
    vi.mocked(retrieveCharge).mockResolvedValue({ status: "pending", paid: false, amount: 500000, qrCodeUrl: "https://qr.example.com/qr.png" } as never);

    const { request, params } = makeRequest("campaign_1");
    const res = await GET(request, { params });
    const data = await res.json();

    expect(data.package.name).toBe("Starter");
    expect(data.product.brandName).toBe("TestBrand");
    expect(data.creators).toHaveLength(2);
    expect(data.creators[0]).toMatchObject({ id: "c1", name: "Alice" });
  });
});
