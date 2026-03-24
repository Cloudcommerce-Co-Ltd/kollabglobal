import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  default: {
    campaign: { findFirst: vi.fn(), update: vi.fn() },
  },
}));

import { PATCH } from "../[id]/shipment/route";
import * as authModule from "@/auth";
import prisma from "@/lib/prisma";

type AuthFn = () => Promise<Session | null>;
const mockAuth = vi.mocked(authModule.auth as AuthFn);

const mockSession: Session = { user: { id: "user-1", email: "test@test.com" }, expires: "2099-01-01" };

const mockCampaign = {
  id: "campaign-123",
  userId: "user-1",
  countryId: 1,
  packageId: 1,
  promotionType: "PRODUCT" as const,
  status: "AWAITING_SHIPMENT" as const,
  duration: 30,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeRequest() {
  return {
    url: "http://localhost/api/campaigns/campaign-123/shipment",
    method: "PATCH",
    json: async () => ({}),
  } as unknown as import("next/server").NextRequest;
}

function makeParams(id = "campaign-123") {
  return { params: Promise.resolve({ id }) };
}

describe("PATCH /api/campaigns/[id]/shipment", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(makeRequest(), makeParams());
    expect(res.status).toBe(401);
  });

  it("returns 404 when campaign not found", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);
    const res = await PATCH(makeRequest(), makeParams());
    expect(res.status).toBe(404);
  });

  it("returns 400 when campaign is not AWAITING_SHIPMENT", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue({ ...mockCampaign, status: "ACCEPTING" });
    const res = await PATCH(makeRequest(), makeParams());
    expect(res.status).toBe(400);
  });

  it("returns 400 when campaign is SERVICE type", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue({ ...mockCampaign, promotionType: "SERVICE" });
    const res = await PATCH(makeRequest(), makeParams());
    expect(res.status).toBe(400);
  });

  it("transitions to ACTIVE on successful shipment confirmation", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign);
    vi.mocked(prisma.campaign.update).mockResolvedValue({ ...mockCampaign, status: "ACTIVE" });
    const res = await PATCH(makeRequest(), makeParams());
    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.campaign.update)).toHaveBeenCalledWith({
      where: { id: "campaign-123" },
      data: { status: "ACTIVE" },
    });
  });
});
