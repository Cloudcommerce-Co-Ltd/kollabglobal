import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    category: { findMany: vi.fn() },
  },
}));

import { NextRequest } from "next/server";
import { GET } from "../route";

const makeRequest = (type?: string) => {
  const url = type
    ? `http://localhost/api/categories?type=${type}`
    : "http://localhost/api/categories";
  return new NextRequest(url);
};

describe("GET /api/categories", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all active categories when no type filter", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: 1, name: "Food", type: "product" },
    ] as never);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([{ id: 1, name: "Food", type: "product" }]);
    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: { id: true, name: true, type: true },
    });
  });

  it("filters by type when type query param is provided", async () => {
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.category.findMany).mockResolvedValue([] as never);

    await GET(makeRequest("service"));

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { isActive: true, type: "service" },
      orderBy: { id: "asc" },
      select: { id: true, name: true, type: true },
    });
  });
});
