import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the AI module before importing route
vi.mock("@/lib/ai", () => ({
  isAIConfigured: vi.fn(),
  getAIModel: vi.fn(() => "mock-model"),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
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
      text: JSON.stringify({
        keys: "Key message here",
        dos: "Do this",
        deliverables: "1 video",
        disclosure: "#ad",
      }),
    } as Awaited<ReturnType<typeof aiSdk.generateText>>);

    const res = await POST(makeRequest(sampleInput));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.keys).toBe("Key message here");
    expect(mockGenerateText).toHaveBeenCalledOnce();
  });

  it("returns 500 when AI response cannot be parsed", async () => {
    mockIsAIConfigured.mockReturnValue(true);
    mockGenerateText.mockResolvedValue({
      text: "not valid json at all",
    } as Awaited<ReturnType<typeof aiSdk.generateText>>);

    const res = await POST(makeRequest(sampleInput));
    expect(res.status).toBe(500);
  });

  it("includes isService context in prompt when isService=true", async () => {
    mockIsAIConfigured.mockReturnValue(true);
    mockGenerateText.mockResolvedValue({
      text: '{"keys":"k","dos":"d","deliverables":"del","disclosure":"disc"}',
    } as Awaited<ReturnType<typeof aiSdk.generateText>>);

    await POST(makeRequest({ ...sampleInput, isService: true }));

    const call = mockGenerateText.mock.calls[0][0];
    expect((call as { prompt: string }).prompt).toContain("บริการ");
  });
});
