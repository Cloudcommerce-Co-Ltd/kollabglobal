import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    user: { findUnique: vi.fn() },
    session: { create: vi.fn() },
  },
}));

import { GET } from "../route";

const makeRequest = () => new Request("http://localhost/api/dev/login");

describe("GET /api/dev/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const res = await GET(makeRequest());
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Not available");
    vi.unstubAllEnvs();
  });

  it("returns 404 when dev user is not found", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const res = await GET(makeRequest());
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("Dev user not found");
    vi.unstubAllEnvs();
  });

  it("redirects to / when dev user exists", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const prisma = (await import("@/lib/prisma")).default;
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: "dev-user-1" } as never);
    vi.mocked(prisma.session.create).mockResolvedValueOnce({} as never);

    const res = await GET(makeRequest());
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("http://localhost/");
    vi.unstubAllEnvs();
  });
});
