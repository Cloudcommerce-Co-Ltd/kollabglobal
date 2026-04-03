import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ProductData } from "@/types/campaign";
import type { BriefForm } from "@/types/brief";

// Use global fetch mock
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Import after stubbing
const { fetchCampaign, fillBriefAI, translateBrief, publishBrief, confirmShipment, updateCampaignStatus } =
  await import("@/lib/brief-api");

function mockResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

const sampleProduct: ProductData = {
  brandName: "TestBrand",
  productName: "Test Product",
  category: "Food",
  description: "Tasty snack",
  sellingPoints: "Healthy",
  url: "https://example.com",
  imageUrl: "",
  isService: false,
};

const sampleForm: BriefForm = {
  name: "Test Campaign",
  keys: "Key messages",
  dos: "Do this",
  deliverables: "1 video",
  disclosure: "#ad",
  deadline: "2026-04-01",
};

describe("fetchCampaign", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns campaign data on success", async () => {
    const campaign = { id: "abc", countryId: 2, packageId: 2, status: "DRAFT", product: null };
    mockFetch.mockReturnValue(mockResponse(campaign));

    const result = await fetchCampaign("abc");
    expect(result).toEqual(campaign);
    expect(mockFetch).toHaveBeenCalledWith("/api/campaigns/abc");
  });

  it("throws when response is not ok", async () => {
    mockFetch.mockReturnValue(mockResponse({}, false, 404));
    await expect(fetchCampaign("notfound")).rejects.toThrow("Campaign not found");
  });
});

describe("fillBriefAI", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns partial brief form on success", async () => {
    const aiResult = { keys: "Key messages from AI", dos: "Do this" };
    mockFetch.mockReturnValue(mockResponse(aiResult));

    const result = await fillBriefAI(sampleProduct);
    expect(result.keys).toBe("Key messages from AI");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/ai/fill-brief",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws on failure", async () => {
    mockFetch.mockReturnValue(mockResponse({}, false, 500));
    await expect(fillBriefAI(sampleProduct)).rejects.toThrow("AI fill failed");
  });
});

describe("translateBrief", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns translated fields on success", async () => {
    const translated = {
      keys: "Keys in Vietnamese",
      dos: "Dos in Vietnamese",
      deliverables: "1 video",
      disclosure: "#ad",
      name: "Campaign VN",
    };
    mockFetch.mockReturnValue(mockResponse(translated));

    const result = await translateBrief(sampleForm, { code: "vi", name: "Vietnamese" });
    expect(result).toEqual(translated);
  });

  it("throws on failure", async () => {
    mockFetch.mockReturnValue(mockResponse({}, false, 500));
    await expect(translateBrief(sampleForm, { code: "vi", name: "Vietnamese" })).rejects.toThrow("Translation failed");
  });
});

describe("confirmShipment", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true on success", async () => {
    mockFetch.mockReturnValue(mockResponse({}, true, 200));
    const result = await confirmShipment("campaign-1");
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith("/api/campaigns/campaign-1/shipment", { method: "PATCH" });
  });

  it("returns false on failure", async () => {
    mockFetch.mockReturnValue(mockResponse({}, false, 400));
    const result = await confirmShipment("campaign-1");
    expect(result).toBe(false);
  });
});

describe("updateCampaignStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true on success", async () => {
    mockFetch.mockReturnValue(mockResponse({}, true, 200));
    const result = await updateCampaignStatus("campaign-1", "ACTIVE");
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/campaigns/campaign-1/status",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("returns false on failure", async () => {
    mockFetch.mockReturnValue(mockResponse({}, false, 400));
    const result = await updateCampaignStatus("campaign-1", "ACTIVE");
    expect(result).toBe(false);
  });
});

describe("publishBrief", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true on success", async () => {
    mockFetch.mockReturnValue(mockResponse({ id: "brief-1" }, true, 201));
    const result = await publishBrief("campaign-1", { ...sampleForm });
    expect(result).toBe(true);
  });

  it("returns false on failure", async () => {
    mockFetch.mockReturnValue(mockResponse({}, false, 400));
    const result = await publishBrief("campaign-1", { ...sampleForm });
    expect(result).toBe(false);
  });
});
