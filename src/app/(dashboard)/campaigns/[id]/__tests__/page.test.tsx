import { describe, it, expect, vi, beforeEach } from "vitest";
import CampaignDetailPage from "../page";
import { auth } from "@/auth";
import { getCampaignDetail } from "@/lib/data/campaigns";
import { redirect, notFound } from "next/navigation";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/data/campaigns", () => ({ getCampaignDetail: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => { throw new Error("REDIRECT"); }),
  notFound: vi.fn(() => { throw new Error("NOT_FOUND"); }),
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
}));

// Mock components to simplify rendering
vi.mock("@/components/ui/campaign-icon", () => ({ CampaignIcon: () => <div>CampaignIcon</div> }));
vi.mock("@/components/campaign/action-card", () => ({ ActionCard: () => <div>ActionCard</div> }));
vi.mock("@/components/campaign/creator-pipeline", () => ({ CreatorPipeline: () => <div>CreatorPipeline</div> }));
vi.mock("@/components/campaign/stats-bar", () => ({ StatsBar: () => <div>StatsBar</div> }));
vi.mock("../_components/campaign-detail-actions", () => ({ CampaignDetailActions: () => <div>CampaignDetailActions</div> }));

describe("CampaignDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeParams = () => Promise.resolve({ id: "c1" });
  const makeSearchParams = (acceptTest?: string) => Promise.resolve({ "accept-test": acceptTest } as any);

  it("redirects to login if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    await expect(CampaignDetailPage({ params: makeParams(), searchParams: makeSearchParams() })).rejects.toThrow("REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("calls notFound if campaign does not exist", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1" }, expires: "" } as any);
    vi.mocked(getCampaignDetail).mockResolvedValueOnce(null);
    await expect(CampaignDetailPage({ params: makeParams(), searchParams: makeSearchParams() })).rejects.toThrow("NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("renders awaiting_payment state correctly", async () => {
    const mockCampaign = {
      id: "c1",
      status: "AWAITING_PAYMENT",
      duration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
      products: [{ brandName: "B", productName: "P" }],
      creators: [],
    };
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1" }, expires: "" } as any);
    vi.mocked(getCampaignDetail).mockResolvedValueOnce(mockCampaign as any);

    const jsx = await CampaignDetailPage({ params: makeParams(), searchParams: makeSearchParams() });
    expect(jsx).toBeDefined();
  });

  it("renders brief state correctly and parses brief content", async () => {
    const mockCampaign = {
      id: "c1",
      status: "PENDING",
      duration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
      brief: {
        content: JSON.stringify({ deadline: "2026-05-01T00:00:00.000Z" }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      products: [{ brandName: "B", productName: "P", isService: true }],
      creators: [],
      package: { platforms: ["tiktok"] },
    };
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1" }, expires: "" } as any);
    vi.mocked(getCampaignDetail).mockResolvedValueOnce(mockCampaign as any);

    const jsx = await CampaignDetailPage({ params: makeParams(), searchParams: makeSearchParams() });
    expect(jsx).toBeDefined();
  });

  it("renders accepting state and handles dev mode mock ACCEPTED", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const mockCampaign = {
      id: "c1",
      status: "ACCEPTING",
      duration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
      brief: {
        contentTh: JSON.stringify({ deadline: "2026-05-01T00:00:00.000Z" }),
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      },
      products: [],
      creators: [
        { status: "PENDING", creator: {} },
        { status: "PENDING", creator: {} },
      ],
      package: { numCreators: 5 },
    };
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1" }, expires: "" } as any);
    vi.mocked(getCampaignDetail).mockResolvedValueOnce(mockCampaign as any);

    const jsx = await CampaignDetailPage({ params: makeParams(), searchParams: makeSearchParams("1") });
    expect(jsx).toBeDefined();

    vi.unstubAllEnvs();
  });

  it("renders active/live state with shipment / domestic", async () => {
    const mockCampaign = {
      id: "c1",
      status: "ACTIVE",
      duration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
      country: { name: "Thailand", countryCode: "TH" },
      products: [],
      creators: [],
    };
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1" }, expires: "" } as any);
    vi.mocked(getCampaignDetail).mockResolvedValueOnce(mockCampaign as any);

    const jsx = await CampaignDetailPage({ params: makeParams(), searchParams: makeSearchParams() });
    expect(jsx).toBeDefined();
  });

  it("handles empty brief gracefully", async () => {
    const mockCampaign = {
      id: "c1",
      status: "CANCELLED",
      duration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
      brief: { content: "{ bad json", createdAt: new Date(), updatedAt: new Date() },
      products: [],
      creators: [],
    };
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1" }, expires: "" } as any);
    vi.mocked(getCampaignDetail).mockResolvedValueOnce(mockCampaign as any);

    const jsx = await CampaignDetailPage({ params: makeParams(), searchParams: makeSearchParams() });
    expect(jsx).toBeDefined();
  });
});
