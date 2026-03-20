import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the AI module before importing route
vi.mock("@/lib/ai", () => ({
  isAIConfigured: vi.fn(),
  getAIModel: vi.fn(() => "mock-model"),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: { object: vi.fn((opts: unknown) => opts) },
  NoObjectGeneratedError: class NoObjectGeneratedError extends Error {
    text: string;
    constructor(msg: string) { super(msg); this.text = msg; }
    static isInstance(e: unknown): e is InstanceType<typeof NoObjectGeneratedError> {
      return e instanceof NoObjectGeneratedError;
    }
  },
}));

import { POST } from "../fill-brief/route";
import * as aiLib from "@/lib/ai";
import * as aiSdk from "ai";

const mockIsAIConfigured = vi.mocked(aiLib.isAIConfigured);
const mockGenerateText = vi.mocked(aiSdk.generateText);

function makeRequest(body: object) {
  return new Request("http://localhost/api/ai/fill-brief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

const sampleInput = {
  brandName: "TestBrand",
  productName: "Test Product",
  category: "Food",
  description: "A tasty snack",
  sellingPoints: "Healthy, delicious",
  isService: false,
};

describe("POST /api/ai/fill-brief", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    mockIsAIConfigured.mockReturnValue(false);

    const res = await POST(makeRequest({ brandName: "BrandOnly" }));
    expect(res.status).toBe(400);
  });

  it("returns mock data when AI is not configured", async () => {
    mockIsAIConfigured.mockReturnValue(false);

    const res = await POST(makeRequest(sampleInput));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("keys");
    expect(data).toHaveProperty("dos");
    expect(data).toHaveProperty("deliverables");
    expect(data).toHaveProperty("disclosure");
    expect(data.disclosure).toContain("TestBrand");
  });

  it("mock disclosure includes brand name without spaces", async () => {
    mockIsAIConfigured.mockReturnValue(false);

    const res = await POST(
      makeRequest({ ...sampleInput, brandName: "My Cool Brand" })
    );
    const data = await res.json();
    expect(data.disclosure).toContain("MyCoolBrand");
  });

  it("calls generateText when AI is configured", async () => {
    mockIsAIConfigured.mockReturnValue(true);
    mockGenerateText.mockResolvedValue({
      output: { keys: "Key message here", dos: "Do this", deliverables: "1 video", disclosure: "#ad" },
    } as Awaited<ReturnType<typeof aiSdk.generateText>>);

    const res = await POST(makeRequest(sampleInput));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.keys).toBe("Key message here");
    expect(mockGenerateText).toHaveBeenCalledOnce();
  });

  it("returns 500 when generateText throws", async () => {
    mockIsAIConfigured.mockReturnValue(true);
    mockGenerateText.mockRejectedValue(new Error("model error"));

    const res = await POST(makeRequest(sampleInput));
    expect(res.status).toBe(500);
  });

  it("includes isService context in prompt when isService=true", async () => {
    mockIsAIConfigured.mockReturnValue(true);
    mockGenerateText.mockResolvedValue({
      output: { keys: "k", dos: "d", deliverables: "del", disclosure: "disc" },
    } as Awaited<ReturnType<typeof aiSdk.generateText>>);

    await POST(makeRequest({ ...sampleInput, isService: true }));

    const call = mockGenerateText.mock.calls[0][0];
    expect((call as { prompt: string }).prompt).toContain("บริการ");
  });

  it("includes countryName in prompt when provided", async () => {
    mockIsAIConfigured.mockReturnValue(true);
    mockGenerateText.mockResolvedValue({
      output: { keys: "k", dos: "d", deliverables: "del", disclosure: "disc" },
    } as Awaited<ReturnType<typeof aiSdk.generateText>>);

    await POST(makeRequest({ ...sampleInput, countryName: "Vietnam" }));

    const call = mockGenerateText.mock.calls[0][0];
    expect((call as { prompt: string }).prompt).toContain("Vietnam");
    expect((call as { prompt: string }).prompt).toContain("ตลาดเป้าหมาย");
  });

  it("includes platforms in prompt when provided", async () => {
    mockIsAIConfigured.mockReturnValue(true);
    mockGenerateText.mockResolvedValue({
      output: { keys: "k", dos: "d", deliverables: "del", disclosure: "disc" },
    } as Awaited<ReturnType<typeof aiSdk.generateText>>);

    await POST(makeRequest({ ...sampleInput, platforms: ["TikTok", "Instagram"] }));

    const call = mockGenerateText.mock.calls[0][0];
    expect((call as { prompt: string }).prompt).toContain("TikTok");
    expect((call as { prompt: string }).prompt).toContain("Instagram");
  });

  it("mock uses packageDeliverables when provided", async () => {
    mockIsAIConfigured.mockReturnValue(false);

    const res = await POST(
      makeRequest({
        ...sampleInput,
        packageDeliverables: ["1 TikTok video (60s)", "3 IG Stories"],
      })
    );
    const data = await res.json();
    expect(data.deliverables).toContain("1 TikTok video (60s)");
    expect(data.deliverables).toContain("3 IG Stories");
  });

  it("mock enriches known platform deliverables with content hints", async () => {
    mockIsAIConfigured.mockReturnValue(false);

    const res = await POST(
      makeRequest({
        ...sampleInput,
        packageDeliverables: ["TikTok 1 วิดีโอ (15–60 วิ)", "IG 1 Reel + 3 Stories"],
      })
    );
    const data = await res.json();
    // Should have content hints, not just bare bullet points
    expect(data.deliverables).toContain("—");
  });

  it("mock uses default deliverables when packageDeliverables not provided", async () => {
    mockIsAIConfigured.mockReturnValue(false);

    const res = await POST(makeRequest(sampleInput));
    const data = await res.json();
    expect(data.deliverables).toContain("TikTok");
  });

  it("includes packageDeliverables constraint in prompt when provided", async () => {
    mockIsAIConfigured.mockReturnValue(true);
    mockGenerateText.mockResolvedValue({
      output: { keys: "k", dos: "d", deliverables: "del", disclosure: "disc" },
    } as Awaited<ReturnType<typeof aiSdk.generateText>>);

    await POST(
      makeRequest({ ...sampleInput, packageDeliverables: ["1 TikTok video", "3 IG Stories"] })
    );

    const call = mockGenerateText.mock.calls[0][0];
    const prompt = (call as { prompt: string }).prompt;
    expect(prompt).toContain("1 TikTok video");
    expect(prompt).toContain("ข้อกำหนด Deliverables");
    expect(prompt).toContain("เพิ่มไอเดียการนำเสนอ");
  });
});
