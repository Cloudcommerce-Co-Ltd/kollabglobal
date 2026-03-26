import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  default: {
    campaign: { findMany: vi.fn() },
  },
}));

import { GET } from "../route";
import * as authModule from "@/auth";
import prisma from "@/lib/prisma";

type AuthFn = () => Promise<Session | null>;
const mockAuth = vi.mocked(authModule.auth as AuthFn);

const mockSession: Session = {
  user: { id: "user-1", email: "test@test.com" },
  expires: "2099-01-01",
};

const makeCampaign = (overrides = {}) => ({
  id: "camp-1",
  userId: "user-1",
  countryId: 1,
  packageId: 1,
  promotionType: "PRODUCT" as const,
  status: "PENDING" as const,
  duration: 30,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  country: { id: 1, name: "Thailand", flag: "🇹🇭" },
  package: { id: 1, name: "Starter", numCreators: 5, platforms: ["tiktok"] },
  product: {
    brandName: "Brand A",
    productName: "Product A",
    isService: false,
    imageUrl: null,
  },
  creators: [{ status: "PENDING" as const }],
  ...overrides,
});

describe("GET /api/campaigns", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 200 with empty array when user has no campaigns", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaign.findMany).mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it("returns 200 with campaigns including relations", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaign.findMany).mockResolvedValue([makeCampaign()]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe("camp-1");
    expect(data[0].country.name).toBe("Thailand");
    expect(data[0].creators).toHaveLength(1);
  });

  it("queries only campaigns belonging to the authenticated user", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaign.findMany).mockResolvedValue([]);
    await GET();
    expect(vi.mocked(prisma.campaign.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-1" }),
      })
    );
  });

  it("orders campaigns by createdAt descending", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaign.findMany).mockResolvedValue([]);
    await GET();
    expect(vi.mocked(prisma.campaign.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("returns 200 with multiple campaigns sorted by date", async () => {
    mockAuth.mockResolvedValue(mockSession);
    const campaigns = [
      makeCampaign({ id: "camp-1", status: "ACTIVE" as const }),
      makeCampaign({ id: "camp-2", status: "ACCEPTING" as const }),
    ];
    vi.mocked(prisma.campaign.findMany).mockResolvedValue(campaigns);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
  });
});
