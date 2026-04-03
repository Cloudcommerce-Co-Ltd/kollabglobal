// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, use: () => ({ id: "camp-1" }) };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Render flags as <span data-testid="flag-XX">XX</span> so we can query by testid
vi.mock("react-country-flag", () => ({
  default: ({ countryCode }: { countryCode: string }) =>
    React.createElement("span", { "data-testid": `flag-${countryCode}` }, countryCode),
}));

vi.mock("@/lib/brief-api", () => ({
  fetchCampaign: vi.fn(),
  fillBriefAI: vi.fn(),
  translateBrief: vi.fn(),
  publishBrief: vi.fn(),
}));

import CreateBriefPage from "../page";
import * as briefApi from "@/lib/brief-api";

const mockFetchCampaign = vi.mocked(briefApi.fetchCampaign);
const mockFillBriefAI = vi.mocked(briefApi.fillBriefAI);
const mockTranslateBrief = vi.mocked(briefApi.translateBrief);

// ── Helpers ────────────────────────────────────────────────────────────────

function makeCreator(countryCode: string | null, index = 0) {
  return {
    id: `cc-${index}`,
    status: "PENDING",
    contentStatus: "NOT_STARTED",
    productId: null,
    creator: {
      id: `cr-${index}`,
      name: `Creator ${index}`,
      niche: "food",
      engagement: "5%",
      reach: "100k",
      avatar: "",
      countryCode,
      platform: "instagram",
      socialHandle: "@test",
      country: null,
    },
  };
}

function makeCampaign(creators: Array<{ countryCode: string | null }>) {
  return {
    id: "camp-1",
    countryId: 1,
    packageId: 1,
    promotionType: "PRODUCT",
    status: "ACTIVE",
    duration: 30,
    products: [
      {
        brandName: "TestBrand",
        productName: "TestProduct",
        category: "food",
        description: "desc",
        sellingPoints: "sp",
        url: "",
        imageUrl: null,
        isService: false,
      },
    ],
    country: { id: 1, name: "Thailand", countryCode: "TH", languageCode: "th", languageName: "Thai" },
    package: { id: 1, name: "Starter", platforms: ["instagram"], deliverables: ["post"], numCreators: 3 },
    brief: null,
    creators: creators.map((c, i) => makeCreator(c.countryCode, i)),
  };
}

function renderPage() {
  render(<CreateBriefPage params={Promise.resolve({ id: "camp-1" })} />);
}

async function waitForLoad() {
  await waitFor(() => expect(screen.queryByText("กำลังโหลด...")).not.toBeInTheDocument());
}

/** Click the dropdown trigger by finding its exact span text and traversing to the parent button */
function openDropdown() {
  // The trigger button contains a span with exactly "-- เลือกภาษา --"
  // Find the span and click its parent button
  const trigger = screen.getByText("-- เลือกภาษา --").closest("button")!;
  fireEvent.click(trigger);
}

afterEach(() => {
  vi.clearAllMocks();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("CreateBriefPage — availableLanguages", () => {
  it("shows ไม่ต้องแปล when all creators are Thai", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "TH" }, { countryCode: "TH" }]) as never);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("ไม่ต้องแปล")).toBeInTheDocument();
    });
    expect(screen.queryByText("-- เลือกภาษา --")).not.toBeInTheDocument();
  });

  it("shows language dropdown trigger when non-Thai creators exist", async () => {
    mockFetchCampaign.mockResolvedValue(
      makeCampaign([{ countryCode: "TH" }, { countryCode: "US" }, { countryCode: "DE" }]) as never
    );
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("-- เลือกภาษา --")).toBeInTheDocument();
    });
  });

  it("shows เลือกภาษาเป้าหมายด้านบน prompt before language is selected", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "TH" }, { countryCode: "JP" }]) as never);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("เลือกภาษาเป้าหมายด้านบน")).toBeInTheDocument();
    });
  });

  it("lists all English-speaking countries as separate options with distinct flags", async () => {
    mockFetchCampaign.mockResolvedValue(
      makeCampaign([{ countryCode: "US" }, { countryCode: "AU" }, { countryCode: "GB" }]) as never
    );
    renderPage();

    await waitForLoad();
    await waitFor(() => screen.getByText("-- เลือกภาษา --"));

    openDropdown();

    await waitFor(() => {
      // Each country produces a separate option button with its flag
      expect(screen.getByTestId("flag-US")).toBeInTheDocument();
      expect(screen.getByTestId("flag-AU")).toBeInTheDocument();
      expect(screen.getByTestId("flag-GB")).toBeInTheDocument();
      // All three show "English" as the language name
      expect(screen.getAllByText(/^English/).length).toBeGreaterThanOrEqual(3);
    });
  });

  it("skips creators with null countryCode gracefully", async () => {
    mockFetchCampaign.mockResolvedValue(
      makeCampaign([{ countryCode: null }, { countryCode: "US" }]) as never
    );
    renderPage();

    await waitForLoad();
    await waitFor(() => screen.getByText("-- เลือกภาษา --"));

    openDropdown();

    await waitFor(() => {
      expect(screen.getByTestId("flag-US")).toBeInTheDocument();
    });
    // null creator should not produce a flag
    expect(screen.queryByTestId("flag-null")).not.toBeInTheDocument();
  });
});

describe("CreateBriefPage — LangDropdown interaction", () => {
  it("opens options and shows German option when DE creator exists", async () => {
    mockFetchCampaign.mockResolvedValue(
      makeCampaign([{ countryCode: "DE" }, { countryCode: "TH" }]) as never
    );
    renderPage();

    await waitForLoad();
    await waitFor(() => screen.getByText("-- เลือกภาษา --"));

    openDropdown();

    await waitFor(() => {
      expect(screen.getByText("German")).toBeInTheDocument();
      expect(screen.getByTestId("flag-DE")).toBeInTheDocument();
    });
  });

  it("shows selected language in trigger button after picking an option", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "JP" }]) as never);
    const user = userEvent.setup();
    renderPage();

    await waitForLoad();
    await waitFor(() => screen.getByText("-- เลือกภาษา --"));

    openDropdown();
    await waitFor(() => screen.getByText("Japanese"));
    await user.click(screen.getByText("Japanese"));

    await waitFor(() => {
      // Trigger button now shows "Japanese" (the selected language name)
      const trigger = screen.queryByText("-- เลือกภาษา --");
      expect(trigger).not.toBeInTheDocument();
      expect(screen.getByText("Japanese")).toBeInTheDocument();
    });
  });

  it("hides เลือกภาษาเป้าหมายด้านบน after selecting a language", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "KR" }]) as never);
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("เลือกภาษาเป้าหมายด้านบน")).toBeInTheDocument();
    });

    openDropdown();
    await waitFor(() => screen.getByText("Korean"));
    await user.click(screen.getByText("Korean"));

    await waitFor(() => {
      expect(screen.queryByText("เลือกภาษาเป้าหมายด้านบน")).not.toBeInTheDocument();
    });
  });
});

describe("CreateBriefPage — translation one-time limit", () => {
  it("disables dropdown and shows แปลสำเร็จ after successful translation", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "US" }]) as never);
    mockTranslateBrief.mockResolvedValue({
      keys: "k", dos: "d", deliverables: "del", disclosure: "#ad", name: "n",
    });

    const user = userEvent.setup();
    renderPage();

    // Select language
    await waitForLoad();
    await waitFor(() => screen.getByText("-- เลือกภาษา --"));
    openDropdown();
    await waitFor(() => screen.getByText("English (US)"));
    await user.click(screen.getByText("English (US)"));

    // Fill all required brief fields
    await waitFor(() => screen.getAllByRole("textbox"));
    for (const ta of screen.getAllByRole("textbox")) {
      if (!(ta as HTMLInputElement).value) {
        await user.type(ta, "test content");
      }
    }

    const translateBtn = screen.getByRole("button", { name: /แปล Brief/i });
    await user.click(translateBtn);

    await waitFor(() => {
      expect(screen.getByText("แปลสำเร็จ")).toBeInTheDocument();
    });

    // Dropdown trigger should appear disabled after translation (via CSS, not HTML attr)
    const trigger = screen.getByText("English").closest("button")!;
    expect(trigger).toHaveClass("cursor-not-allowed");
  });
});

describe("CreateBriefPage — AI prompt dialog", () => {
  async function openAIDialog() {
    const user = userEvent.setup();
    renderPage();
    await waitForLoad();
    const aiBtn = screen.getByRole("button", { name: /ให้ AI ช่วยเขียน/i });
    await user.click(aiBtn);
    await waitFor(() => screen.getByText("Fill brief with AI"));
    return user;
  }

  it("opens dialog when clicking AI button", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "TH" }]) as never);
    await openAIDialog();
    expect(screen.getByText("Fill brief with AI")).toBeInTheDocument();
  });

  it("closes dialog when clicking ยกเลิก", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "TH" }]) as never);
    const user = await openAIDialog();
    await user.click(screen.getByRole("button", { name: /ยกเลิก/i }));
    await waitFor(() => {
      expect(screen.queryByText("Fill brief with AI")).not.toBeInTheDocument();
    });
  });

  it("updates character counter as user types in textarea", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "TH" }]) as never);
    const user = await openAIDialog();
    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "hello");
    await waitFor(() => {
      expect(screen.getByText("5 / 500")).toBeInTheDocument();
    });
  });

  it("calls fillBriefAI with userPrompt on submit", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "TH" }]) as never);
    mockFillBriefAI.mockResolvedValue({});
    const user = await openAIDialog();
    await user.type(screen.getByRole("textbox"), "เน้นออร์แกนิค");
    await user.click(screen.getByRole("button", { name: /สร้าง Brief/i }));
    await waitFor(() => {
      expect(mockFillBriefAI).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ userPrompt: "เน้นออร์แกนิค" })
      );
    });
  });

  it("populates brief fields with AI response on success", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "TH" }]) as never);
    mockFillBriefAI.mockResolvedValue({
      keys: "AI key message",
      dos: "AI dos",
      deliverables: "AI deliverables",
      disclosure: "#ai",
    });
    const user = await openAIDialog();
    await user.click(screen.getByRole("button", { name: /สร้าง Brief/i }));
    await waitFor(() => {
      expect(screen.queryByText("Fill brief with AI")).not.toBeInTheDocument();
    });
    await waitFor(() => {
      const textboxes = screen.getAllByRole("textbox");
      const values = textboxes.map((el) => (el as HTMLTextAreaElement).value);
      expect(values).toEqual(expect.arrayContaining(["AI key message", "AI dos", "AI deliverables", "#ai"]));
    });
  });

  it("shows error message on AI failure", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "TH" }]) as never);
    mockFillBriefAI.mockRejectedValue(new Error("AI fill failed"));
    const user = await openAIDialog();
    await user.click(screen.getByRole("button", { name: /สร้าง Brief/i }));
    await waitFor(() => {
      expect(screen.getByText("AI fill ล้มเหลว กรุณาลองอีกครั้ง")).toBeInTheDocument();
    });
  });

  it("disables AI button and shows AI Filled after successful fill", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "TH" }]) as never);
    mockFillBriefAI.mockResolvedValue({ keys: "k", dos: "d", deliverables: "del", disclosure: "#ad" });
    const user = await openAIDialog();
    await user.click(screen.getByRole("button", { name: /สร้าง Brief/i }));
    await waitFor(() => {
      const aiBtn = screen.getByRole("button", { name: /AI Filled/i });
      expect(aiBtn).toBeDisabled();
    });
  });

  it("calls fillBriefAI without userPrompt when textarea is empty", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "TH" }]) as never);
    mockFillBriefAI.mockResolvedValue({});
    const user = await openAIDialog();
    await user.click(screen.getByRole("button", { name: /สร้าง Brief/i }));
    await waitFor(() => {
      expect(mockFillBriefAI).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ userPrompt: undefined })
      );
    });
  });
});

describe("CreateBriefPage — publish gate", () => {
  it("shows กรอก Brief ก่อน hint when form is empty regardless of creator language", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "US" }]) as never);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("กรอก Brief ก่อน")).toBeInTheDocument();
    });
  });

  it("shows เลือกภาษาและแปล Brief ก่อน when content filled but language not selected", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "US" }]) as never);
    const user = userEvent.setup();
    renderPage();

    await waitForLoad();

    // Fill all textbox fields (keys, dos, deliverables, disclosure, name)
    for (const ta of screen.getAllByRole("textbox")) {
      await user.type(ta, "test content");
    }
    // Set deadline via date input
    const dateInputs = screen.getAllByDisplayValue("");
    const dateInput = dateInputs.find(el => (el as HTMLInputElement).type === "date");
    if (dateInput) await user.type(dateInput, "2026-06-01");

    await waitFor(() => {
      expect(screen.getByText("เลือกภาษาและแปล Brief ก่อน")).toBeInTheDocument();
    });
  });

  it("does not show ไม่ต้องแปล when creators are mixed Thai+foreign", async () => {
    mockFetchCampaign.mockResolvedValue(
      makeCampaign([{ countryCode: "TH" }, { countryCode: "US" }]) as never
    );
    renderPage();

    await waitForLoad();
    expect(screen.queryByText("ไม่ต้องแปล")).not.toBeInTheDocument();
  });

  it("does not show translation dropdown when all creators are Thai", async () => {
    mockFetchCampaign.mockResolvedValue(makeCampaign([{ countryCode: "TH" }]) as never);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("ไม่ต้องแปล")).toBeInTheDocument();
    });
    expect(screen.queryByText("-- เลือกภาษา --")).not.toBeInTheDocument();
  });
});
