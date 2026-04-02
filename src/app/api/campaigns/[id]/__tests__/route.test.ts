import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  default: {
    campaign: { findFirst: vi.fn(), update: vi.fn() },
  },
}));

import { GET } from "../route";
import * as authModule from "@/auth";
import prisma from "@/lib/prisma";

type AuthFn = () => Promise<Session | null>;
const mockAuth = vi.mocked(authModule.auth as AuthFn);
const mockFindFirst = vi.mocked(prisma.campaign.findFirst);

const mockSession: Session = {
  user: { id: "user-1", email: "test@test.com" },
  expires: "2099-01-01",
};

const mockCampaignWithCreatorCountry = {
  id: "camp-1",
  userId: "user-1",
  countryId: 1,
  packageId: 1,
  promotionType: "PRODUCT",
  status: "ACTIVE",
  duration: 30,
  createdAt: new Date(),
  updatedAt: new Date(),
  country: { id: 1, name: "Thailand", countryCode: "TH", languageCode: "th", languageName: "Thai" },
  package: { id: 1, name: "Starter", platforms: ["instagram"], deliverables: ["post"], numCreators: 3 },
  brief: null,
  products: [],
  creators: [
    {
      id: "cc-1",
      campaignId: "camp-1",
      creatorId: "cr-1",
      productId: null,
      status: "PENDING",
      contentStatus: "NOT_STARTED",
      creator: {
        id: "cr-1",
        name: "Karina",
        niche: "lifestyle",
        engagement: "4%",
        reach: "200k",
        avatar: "",
        countryCode: "DE",
        countryId: null,
        platform: "instagram",
        socialHandle: "@karina",
        portfolioUrl: null,
        country: null, // DE has no Country row in DB
      },
    },
    {
      id: "cc-2",
      campaignId: "camp-1",
      creatorId: "cr-2",
      productId: null,
      status: "PENDING",
      contentStatus: "NOT_STARTED",
      creator: {
        id: "cr-2",
        name: "Wanida",
        niche: "food",
        engagement: "6%",
        reach: "100k",
        avatar: "",
        countryCode: "TH",
        countryId: 1,
        platform: "tiktok",
        socialHandle: "@wanida",
        portfolioUrl: null,
        country: { id: 1, name: "Thailand", countryCode: "TH", languageCode: "th", languageName: "Thai" },
      },
    },
  ],
};

function makeRequest() {
  return { url: "http://localhost/api/campaigns/camp-1", method: "GET" } as unknown as NextRequest;
}

function makeParams(id = "camp-1") {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(mockSession);
});

describe("GET /api/campaigns/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeRequest(), makeParams());
    expect(res.status).toBe(401);
  });

  it("returns 404 when campaign not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const res = await GET(makeRequest(), makeParams());
    expect(res.status).toBe(404);
  });

  it("returns campaign with creator country relation included", async () => {
    mockFindFirst.mockResolvedValue(mockCampaignWithCreatorCountry as never);

    const res = await GET(makeRequest(), makeParams());
    expect(res.status).toBe(200);

    const body = await res.json();
    // Thai creator has country relation populated
    const thaiCreator = body.creators.find((c: { creator: { countryCode: string } }) => c.creator.countryCode === "TH");
    expect(thaiCreator.creator.country).not.toBeNull();
    expect(thaiCreator.creator.country.languageCode).toBe("th");

    // German creator has null country relation (no Country row in DB for DE)
    const deCreator = body.creators.find((c: { creator: { countryCode: string } }) => c.creator.countryCode === "DE");
    expect(deCreator.creator.countryCode).toBe("DE");
    expect(deCreator.creator.country).toBeNull();
  });

  it("calls findFirst with nested creator.country include", async () => {
    mockFindFirst.mockResolvedValue(mockCampaignWithCreatorCountry as never);

    await GET(makeRequest(), makeParams());

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          creators: expect.objectContaining({
            include: expect.objectContaining({
              creator: expect.objectContaining({
                include: expect.objectContaining({ country: true }),
              }),
            }),
          }),
        }),
      })
    );
  });
});

describe("PATCH /api/campaigns/[id]", () => {
  const mockUpdate = vi.mocked(prisma.campaign.update);

  function makePatchRequest(body: any = {}) {
    return {
      url: "http://localhost/api/campaigns/camp-1",
      method: "PATCH",
      json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  }

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await (await import("../route")).PATCH(makePatchRequest(), makeParams());
    expect(res.status).toBe(401);
  });

  it("returns 404 when campaign not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const res = await (await import("../route")).PATCH(makePatchRequest(), makeParams());
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid body schema", async () => {
    mockFindFirst.mockResolvedValue(mockCampaignWithCreatorCountry as never);
    // Invalid body (status must be string enum, not number)
    const res = await (await import("../route")).PATCH(makePatchRequest({ status: 123 }), makeParams());
    expect(res.status).toBe(400);
  });

  it("updates campaign and returns 200 on success", async () => {
    mockFindFirst.mockResolvedValue(mockCampaignWithCreatorCountry as never);
    const updatedMock = { ...mockCampaignWithCreatorCountry, status: "DRAFT" };
    mockUpdate.mockResolvedValue(updatedMock as never);

    const res = await (await import("../route")).PATCH(makePatchRequest({ status: "DRAFT" }), makeParams());
    expect(res.status).toBe(200);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "camp-1" },
      data: { status: "DRAFT" },
    });

    const body = await res.json();
    expect(body.status).toBe("DRAFT");
  });
});
