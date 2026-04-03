import { describe, it, expect } from "vitest";
import {
  isBriefContentFilled,
  canPublishBrief,
  buildFillBriefPayload,
  buildTranslatePayload,
  prepareBriefContent,
} from "@/lib/brief-utils";
import type { BriefForm } from "@/types/brief";
import type { ProductData } from "@/types/campaign";

const emptyForm: BriefForm = {
  name: "",
  keys: "",
  dos: "",
  deliverables: "",
  disclosure: "",
  deadline: "",
};

const filledForm: BriefForm = {
  name: "Test Campaign",
  keys: "Key messages here",
  dos: "Do this",
  deliverables: "1 video",
  disclosure: "#ad",
  deadline: "2026-04-01",
};

describe("isBriefContentFilled", () => {
  it("returns false when all fields empty", () => {
    expect(isBriefContentFilled(emptyForm)).toBe(false);
  });

  it("returns false when some fields missing", () => {
    expect(isBriefContentFilled({ ...filledForm, keys: "" })).toBe(false);
    expect(isBriefContentFilled({ ...filledForm, dos: "" })).toBe(false);
    expect(isBriefContentFilled({ ...filledForm, deliverables: "" })).toBe(false);
    expect(isBriefContentFilled({ ...filledForm, disclosure: "" })).toBe(false);
  });

  it("returns true when all required fields filled", () => {
    expect(isBriefContentFilled(filledForm)).toBe(true);
  });

  it("deadline does not affect content filled check", () => {
    expect(isBriefContentFilled({ ...filledForm, deadline: "" })).toBe(true);
  });
});

describe("canPublishBrief", () => {
  it("returns false when content not filled", () => {
    expect(canPublishBrief(emptyForm, false, false)).toBe(false);
  });

  it("returns false when deadline missing", () => {
    const noDeadline = { ...filledForm, deadline: "" };
    expect(canPublishBrief(noDeadline, false, false)).toBe(false);
  });

  it("returns true when no translation needed and content+deadline filled", () => {
    expect(canPublishBrief(filledForm, false, false)).toBe(true);
  });

  it("returns false when translation needed but not done", () => {
    expect(canPublishBrief(filledForm, true, false)).toBe(false);
  });

  it("returns true when translation needed and done", () => {
    expect(canPublishBrief(filledForm, true, true)).toBe(true);
  });
});

describe("buildFillBriefPayload", () => {
  const product: ProductData = {
    brandName: "TestBrand",
    productName: "Test Product",
    category: "Food",
    description: "A tasty snack",
    sellingPoints: "Healthy",
    url: "https://example.com",
    imageUrl: "",
    isService: false,
  };

  it("maps product fields correctly", () => {
    const payload = buildFillBriefPayload(product);
    expect(payload.brandName).toBe("TestBrand");
    expect(payload.productName).toBe("Test Product");
    expect(payload.category).toBe("Food");
    expect(payload.isService).toBe(false);
    expect(payload.url).toBe("https://example.com");
  });

  it("omits url when empty string", () => {
    const payload = buildFillBriefPayload({ ...product, url: "" });
    expect(payload.url).toBeUndefined();
  });

  it("includes campaign context when provided", () => {
    const payload = buildFillBriefPayload(product, {
      countryName: "Vietnam",
      platforms: ["TikTok", "Instagram"],
      packageDeliverables: ["1 TikTok video", "3 IG Stories"],
    });
    expect(payload.countryName).toBe("Vietnam");
    expect(payload.platforms).toEqual(["TikTok", "Instagram"]);
    expect(payload.packageDeliverables).toEqual(["1 TikTok video", "3 IG Stories"]);
  });

  it("omits context fields when context is undefined", () => {
    const payload = buildFillBriefPayload(product);
    expect(payload.countryName).toBeUndefined();
    expect(payload.platforms).toBeUndefined();
    expect(payload.packageDeliverables).toBeUndefined();
  });

  it("omits context fields when empty arrays", () => {
    const payload = buildFillBriefPayload(product, {
      platforms: [],
      packageDeliverables: [],
    });
    expect(payload.platforms).toBeUndefined();
    expect(payload.packageDeliverables).toBeUndefined();
  });

  it("includes userPrompt when provided", () => {
    const payload = buildFillBriefPayload(product, {
      userPrompt: "เน้นความเป็นธรรมชาติ",
    });
    expect(payload.userPrompt).toBe("เน้นความเป็นธรรมชาติ");
  });

  it("omits userPrompt when empty or undefined", () => {
    const payload = buildFillBriefPayload(product, { userPrompt: undefined });
    expect(payload.userPrompt).toBeUndefined();

    const payload2 = buildFillBriefPayload(product, { userPrompt: "" });
    expect(payload2.userPrompt).toBeUndefined();
  });
});

describe("buildTranslatePayload", () => {
  it("builds correct translate payload", () => {
    const payload = buildTranslatePayload(filledForm, { code: "vi", name: "Vietnamese" });
    expect(payload.targetLang).toBe("vi");
    expect(payload.targetLangName).toBe("Vietnamese");
    expect(payload.fields.keys).toBe(filledForm.keys);
    expect(payload.fields.name).toBe(filledForm.name);
  });
});

describe("prepareBriefContent", () => {
  it("returns thaiContent as contentTh when translated provided", () => {
    const content = { ...filledForm };
    const translated = {
      keys: "Key in EN",
      dos: "Dos in EN",
      deliverables: "Deliverables EN",
      disclosure: "#ad",
      name: "Campaign EN",
    };
    const result = prepareBriefContent(content, translated);
    expect(result.contentTh).toBe(JSON.stringify(content));
    expect(result.finalContent).toBe(JSON.stringify(translated));
  });

  it("returns null contentTh when no translation", () => {
    const result = prepareBriefContent(filledForm);
    expect(result.contentTh).toBeNull();
    expect(result.finalContent).toBe(JSON.stringify(filledForm));
  });
});
