import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";
import { prepareBriefContent } from "@/lib/brief-utils";

// ── Pure function tests (no mocking needed) ────────────────────────────────

describe("prepareBriefContent", () => {
  const content = {
    keys: "ภาษาไทย",
    dos: "do",
    deliverables: "1 video",
    disclosure: "#ad",
    deadline: "2026-04-01",
    name: "Campaign",
  };

  it("stores Thai content as finalContent when no translation", () => {
    const { finalContent, contentTh } = prepareBriefContent(content);
    expect(finalContent).toBe(JSON.stringify(content));
    expect(contentTh).toBeNull();
  });

  it("stores translated content as finalContent and Thai as contentTh", () => {
    const translated = { keys: "Vietnamese", dos: "d", deliverables: "del", disclosure: "#", name: "n" };
    const { finalContent, contentTh } = prepareBriefContent(content, translated);
    expect(finalContent).toBe(JSON.stringify(translated));
    expect(contentTh).toBe(JSON.stringify(content));
  });

  it("returns null contentTh when no translation provided", () => {
    const { contentTh } = prepareBriefContent(content, undefined);
    expect(contentTh).toBeNull();
  });
});

// ── Route handler tests ────────────────────────────────────────────────────

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  default: {
    campaignBrief: { findFirst: vi.fn(), upsert: vi.fn() },
    campaign: { findFirst: vi.fn(), update: vi.fn() },
  },
}));

import { POST, GET } from "../[id]/brief/route";
import * as authModule from "@/auth";
import prisma from "@/lib/prisma";

type AuthFn = () => Promise<Session | null>;
const mockAuth = vi.mocked(authModule.auth as AuthFn);

const mockSession: Session = { user: { id: "user-1", email: "test@test.com" }, expires: "2099-01-01" };

const mockBrief = {
  id: "brief-1",
  campaignId: "campaign-123",
  content: '{"keys":"k"}',
  contentTh: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCampaign = {
  id: "campaign-123",
  userId: "user-1",
  countryId: 1,
  packageId: 1,
  promotionType: "PRODUCT" as const,
  status: "DRAFT" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeRequest(method: string, body?: object) {
  return {
    url: `http://localhost/api/campaigns/campaign-123/brief`,
    method,
    json: async () => body ?? {},
  } as unknown as import("next/server").NextRequest;
}

function makeParams(id = "campaign-123") {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/campaigns/[id]/brief", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest("POST", {}), makeParams());
    expect(res.status).toBe(401);
  });

  it("returns 404 when campaign not found", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);
    const res = await POST(makeRequest("POST", { content: {} }), makeParams());
    expect(res.status).toBe(404);
  });

  it("returns 400 when content body is invalid", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign);

    // Missing required fields in content
    const res = await POST(makeRequest("POST", { content: { keys: "" } }), makeParams());
    expect(res.status).toBe(400);
  });

  it("saves brief and updates campaign to ACTIVE", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign);
    vi.mocked(prisma.campaignBrief.upsert).mockResolvedValue(mockBrief);
    vi.mocked(prisma.campaign.update).mockResolvedValue({ ...mockCampaign, status: "ACTIVE" });

    const content = { keys: "k", dos: "d", deliverables: "del", disclosure: "#", deadline: "2026-04-01", name: "n" };
    const res = await POST(makeRequest("POST", { content }), makeParams());

    expect(res.status).toBe(201);
    expect(vi.mocked(prisma.campaign.update)).toHaveBeenCalledWith({
      where: { id: "campaign-123" },
      data: { status: "ACTIVE" },
    });
  });
});

describe("GET /api/campaigns/[id]/brief", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeRequest("GET"), makeParams());
    expect(res.status).toBe(401);
  });

  it("returns 404 when brief not found", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaignBrief.findFirst).mockResolvedValue(null);
    const res = await GET(makeRequest("GET"), makeParams());
    expect(res.status).toBe(404);
  });

  it("returns brief when found", async () => {
    mockAuth.mockResolvedValue(mockSession);
    vi.mocked(prisma.campaignBrief.findFirst).mockResolvedValue(mockBrief);
    const res = await GET(makeRequest("GET"), makeParams());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("brief-1");
  });
});
