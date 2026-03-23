// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CheckoutPage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));
import { useCampaignStore } from "@/stores/campaign-store";
import type { Creator, Country, Package } from "@/types";

const MOCK_COUNTRY: Country = {
  id: 1,
  name: "Thailand",
  flag: "🇹🇭",
  creatorsAvail: 100,
  avgEyeball: null,
  avgCPE: null,
  foodBevEng: null,
  beautyEng: null,
  snackTrend: null,
  platforms: ["tiktok", "instagram"],
  cats: ["food"],
  estReach: null,
  estOrders: null,
  isActive: true,
};

const MOCK_PACKAGE: Package = {
  id: 2,
  name: "The Global Bridge",
  tagline: "ขยายฐานข้ามแพลตฟอร์ม",
  badge: "แนะนำ",
  numCreators: 10,
  price: 3500,
  platforms: ["tiktok", "instagram"],
  deliverables: ["TikTok 1 วิดีโอ (15–60 วิ)", "IG 1 Reel + 3 Stories"],
  cpmLabel: "฿39 / 1K reach",
  cpmSavings: "77%",
  estReach: "500K-1.2M",
  estEngagement: "3.5-5.5%",
};

const BASE_PRICE = MOCK_PACKAGE.numCreators * MOCK_PACKAGE.price;
const VAT = Math.round(BASE_PRICE * 0.07);
const SERVICE_FEE = Math.round(BASE_PRICE * 0.03);
const TOTAL = BASE_PRICE + VAT + SERVICE_FEE;

const MOCK_CREATORS: Creator[] = Array.from({ length: 10 }, (_, i) => ({
  id: `creator-${i}`,
  name: `Creator ${i}`,
  niche: "The Global Bridge",
  engagement: "N/A",
  reach: "N/A",
  avatar: `https://example.com/avatar-${i}.jpg`,
  countryFlag: "🇹🇭",
  isBackup: false,
  platform: null, socialHandle: null, portfolioUrl: null,
}));

const mockFetchPending = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    chargeId: "chrg_test_123",
    qrCodeUrl: "https://example.com/qr.png",
    paymentId: "payment_1",
    campaignId: "campaign_1",
  }),
});

beforeEach(() => {
  useCampaignStore.getState().reset();
  useCampaignStore.getState().setCountry(MOCK_COUNTRY);
  useCampaignStore.getState().setPackage(MOCK_PACKAGE);
  useCampaignStore.getState().setCreators(MOCK_CREATORS);
  useCampaignStore.getState().setPromotionType("PRODUCT");
  useCampaignStore.getState().setProduct({
    brandName: "Brand", productName: "Product", category: "Food",
    description: "", sellingPoints: "", url: "", imageUrl: "", isService: false,
  });
  vi.stubGlobal("fetch", mockFetchPending);
  mockPush.mockClear();
  mockFetchPending.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CheckoutPage", () => {
  it("renders title สรุปรายการ & ชำระเงิน", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("สรุปรายการ & ชำระเงิน")).toBeInTheDocument();
  });

  it("shows package name from store", () => {
    render(<CheckoutPage />);
    expect(screen.getAllByText(MOCK_PACKAGE.name).length).toBeGreaterThan(0);
  });

  it("shows 10 creator avatars from store", () => {
    render(<CheckoutPage />);
    for (const creator of MOCK_CREATORS) {
      expect(screen.getByTitle(creator.name)).toBeInTheDocument();
    }
  });

  it("shows price breakdown values", () => {
    render(<CheckoutPage />);
    expect(screen.getByText(`฿${BASE_PRICE.toLocaleString()}`)).toBeInTheDocument();
    expect(screen.getByText(`฿${VAT.toLocaleString()}`)).toBeInTheDocument();
    expect(screen.getByText(`฿${SERVICE_FEE.toLocaleString()}`)).toBeInTheDocument();
  });

  it("shows total price", () => {
    render(<CheckoutPage />);
    expect(screen.getByText(`฿${TOTAL.toLocaleString()}`)).toBeInTheDocument();
  });

  it("renders QR placeholder area", () => {
    render(<CheckoutPage />);
    expect(screen.getByLabelText("QR Code")).toBeInTheDocument();
  });

  it("shows QR code image after charge creation succeeds", async () => {
    render(<CheckoutPage />);
    await waitFor(() => {
      const img = screen.getByAltText("PromptPay QR Code") as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toBe("https://example.com/qr.png");
    });
  });

  it("shows waiting for payment status text after charge is created", async () => {
    render(<CheckoutPage />);
    await waitFor(() => {
      expect(screen.getByText("รอการชำระเงิน")).toBeInTheDocument();
    });
  });

  it("payment method toggle works visually", () => {
    render(<CheckoutPage />);
    const toggleBtn = screen.getByText("เปลี่ยนวิธีชำระเงิน");
    fireEvent.click(toggleBtn);
    expect(screen.getByText("บัตรเครดิต / เดบิต")).toBeInTheDocument();
    expect(screen.getByText("โอนผ่านธนาคาร")).toBeInTheDocument();
    fireEvent.click(screen.getByText("← กลับไปสแกน QR"));
    expect(screen.getByText("เปลี่ยนวิธีชำระเงิน")).toBeInTheDocument();
  });

  it("shows updated terms disclaimer", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("เมื่อสแกนและชำระเงินสำเร็จ ถือว่าคุณยอมรับเงื่อนไขการใช้บริการ")).toBeInTheDocument();
  });

  it("calls create-charge API on mount with correct data (no amount field)", async () => {
    render(<CheckoutPage />);
    await waitFor(() => {
      expect(mockFetchPending).toHaveBeenCalledWith(
        "/api/payments/create-charge",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"countryId":1'),
        })
      );
      // Amount must NOT be sent — server computes it from packageId
      const callBody = JSON.parse(mockFetchPending.mock.calls[0][1].body as string);
      expect(callBody).not.toHaveProperty("amount");
    });
  });

  it("shows failure state when charge creation fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    render(<CheckoutPage />);
    await waitFor(() => {
      expect(screen.getByText("การชำระเงินล้มเหลว กรุณาลองใหม่")).toBeInTheDocument();
    });
  });
});
