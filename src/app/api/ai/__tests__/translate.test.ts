import { describe, it, expect, vi, beforeEach } from "vitest";

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

import { POST } from "../translate/route";
import * as aiLib from "@/lib/ai";
import * as aiSdk from "ai";

const mockIsAIConfigured = vi.mocked(aiLib.isAIConfigured);
const mockGenerateText = vi.mocked(aiSdk.generateText);

function makeRequest(body: object) {
  return new Request("http://localhost/api/ai/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

const sampleFields = {
  keys: "Key message in Thai",
  dos: "Do this in Thai",
  deliverables: "1 video",
  disclosure: "#ad #ไทย",
  name: "แคมเปญ",
};

describe("POST /api/ai/translate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    mockIsAIConfigured.mockReturnValue(false);

    const res = await POST(makeRequest({ fields: sampleFields })); // missing targetLang and targetLangName
    expect(res.status).toBe(400);
  });

  it("returns fields unchanged when AI is not configured (mock passthrough)", async () => {
    mockIsAIConfigured.mockReturnValue(false);

    const res = await POST(
      makeRequest({
        fields: sampleFields,
        targetLang: "vi",
        targetLangName: "Vietnamese",
      })
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual(sampleFields);
  });

  it("calls generateText with Output.object when AI is configured", async () => {
    mockIsAIConfigured.mockReturnValue(true);
    const translated = {
      keys: "Key in Vietnamese",
      dos: "Do this in Vietnamese",
      deliverables: "1 video",
      disclosure: "#ad",
      name: "Campaign",
    };
    mockGenerateText.mockResolvedValue({
      output: translated,
    } as Awaited<ReturnType<typeof aiSdk.generateText>>);

    const res = await POST(
      makeRequest({
        fields: sampleFields,
        targetLang: "vi",
        targetLangName: "Vietnamese",
      })
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual(translated);
    expect(mockGenerateText).toHaveBeenCalledOnce();
  });

  it("returns 500 when generateText throws", async () => {
    mockIsAIConfigured.mockReturnValue(true);
    mockGenerateText.mockRejectedValue(new Error("model error"));

    const res = await POST(
      makeRequest({
        fields: sampleFields,
        targetLang: "vi",
        targetLangName: "Vietnamese",
      })
    );
    expect(res.status).toBe(500);
  });

  it("prompt includes target language name", async () => {
    mockIsAIConfigured.mockReturnValue(true);
    mockGenerateText.mockResolvedValue({
      output: sampleFields,
    } as Awaited<ReturnType<typeof aiSdk.generateText>>);

    await POST(
      makeRequest({
        fields: sampleFields,
        targetLang: "ja",
        targetLangName: "Japanese",
      })
    );

    const call = mockGenerateText.mock.calls[0][0];
    expect((call as { prompt: string }).prompt).toContain("Japanese");
  });
});
