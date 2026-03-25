import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    country: { findMany: vi.fn() },
  },
}));

import { GET } from "../route";
import prisma from "@/lib/prisma";

const makeCountry = (id: number, name: string, creatorCount: number) => ({
  id,
  name,
  flag: "🏳️",
  region: "asia",
  languageCode: "en",
  languageName: "English",
  creatorsAvail: 999, // hardcoded value — should be overridden by real count
  avgEyeball: null,
  avgCPE: null,
  foodBevEng: null,
  beautyEng: null,
  snackTrend: null,
  platforms: [],
  cats: [],
  estReach: null,
  estOrders: null,
  isActive: true,
  _count: { creators: creatorCount },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/countries", () => {
  it("returns 200", async () => {
    vi.mocked(prisma.country.findMany).mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("sorts countries by creator count descending", async () => {
    vi.mocked(prisma.country.findMany).mockResolvedValue([
      makeCountry(2, "Vietnam", 3),
      makeCountry(1, "Thailand", 21),
      makeCountry(3, "Japan", 0),
    ] as never);

    const res = await GET();
    const data = await res.json();
    const names = data.map((c: { name: string }) => c.name);
    expect(names).toEqual(["Thailand", "Vietnam", "Japan"]);
  });

  it("overrides creatorsAvail with real creator count", async () => {
    vi.mocked(prisma.country.findMany).mockResolvedValue([
      makeCountry(1, "Thailand", 21),
    ] as never);

    const res = await GET();
    const [country] = await res.json();
    expect(country.creatorsAvail).toBe(21);
  });

  it("strips _count from response", async () => {
    vi.mocked(prisma.country.findMany).mockResolvedValue([
      makeCountry(1, "Thailand", 21),
    ] as never);

    const res = await GET();
    const [country] = await res.json();
    expect(country).not.toHaveProperty("_count");
  });

  it("breaks ties alphabetically by name", async () => {
    vi.mocked(prisma.country.findMany).mockResolvedValue([
      makeCountry(3, "Vietnam", 0),
      makeCountry(2, "Malaysia", 0),
      makeCountry(1, "Thailand", 0),
    ] as never);

    const res = await GET();
    const data = await res.json();
    const names = data.map((c: { name: string }) => c.name);
    expect(names).toEqual(["Malaysia", "Thailand", "Vietnam"]);
  });
});
