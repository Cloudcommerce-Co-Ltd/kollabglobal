import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    packageCreator: { findMany: vi.fn() },
  },
}));

import { GET } from "../route";

const makeRequest = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/creators");
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  return new Request(url.toString());
};

describe("GET /api/creators", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when packageId is missing", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("packageId");
  });

  it("returns 400 when packageId is not a number", async () => {
    const res = await GET(makeRequest({ packageId: "abc" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("packageId must be a number");
  });

  it("returns creators for valid packageId", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.packageCreator.findMany).mockResolvedValueOnce([
      {
        creator: { id: "c1", name: "Alice", niche: "Food", engagement: "5%", reach: "100K", avatar: "👩", countryCode: "TH", countryId: 1, platform: "TikTok", socialHandle: "@alice", portfolioUrl: null },
        isBackup: false,
        sortOrder: 0,
      },
    ] as never);

    const res = await GET(makeRequest({ packageId: "1" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe("c1");
  });
});
