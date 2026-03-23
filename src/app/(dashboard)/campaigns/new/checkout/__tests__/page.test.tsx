// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CheckoutPage from "../page";
import { useCampaignStore } from "@/stores/campaign-store";
import type { Creator, Package } from "@/types";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const MOCK_PACKAGE: Package = {
  id: 2,
  name: "Popular",
  badge: "แนะนำ",
  numCreators: 10,
  pricePerCreator: 3500,
  discountPct: 5,
  estReach: "500K-1.2M",
  estEngagement: "3.5-5.5%",
};

const MOCK_CREATORS: Creator[] = Array.from({ length: 10 }, (_, i) => ({
  id: `creator-${i}`,
  name: `Creator ${i}`,
  niche: "The Global Bridge",
  engagement: "N/A",
  reach: "N/A",
  avatar: `https://example.com/avatar-${i}.jpg`,
  countryFlag: "🇹🇭",
  isBackup: false,
}));

beforeEach(() => {
  useCampaignStore.getState().reset();
  useCampaignStore.getState().setPackage(MOCK_PACKAGE);
  useCampaignStore.getState().setCreators(MOCK_CREATORS);
  useCampaignStore.getState().setProduct({
    brandName: "Brand", productName: "Product", category: "Food",
    description: "", sellingPoints: "", url: "", imageUrl: "", isService: false,
  });
  mockPush.mockClear();
});

describe("CheckoutPage", () => {
  it("renders title สรุปรายการ & ชำระเงิน", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("สรุปรายการ & ชำระเงิน")).toBeInTheDocument();
  });

  it("shows package name Popular", () => {
    render(<CheckoutPage />);
    expect(screen.getAllByText("Popular").length).toBeGreaterThan(0);
  });

  it("shows 10 creator avatars from store", () => {
    render(<CheckoutPage />);
    for (const creator of MOCK_CREATORS) {
      expect(screen.getByTitle(creator.name)).toBeInTheDocument();
    }
  });

  it("shows price breakdown values", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("฿33,250")).toBeInTheDocument();
    expect(screen.getByText("฿2,328")).toBeInTheDocument();
    expect(screen.getByText("฿998")).toBeInTheDocument();
  });

  it("shows total price", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("฿36,576")).toBeInTheDocument();
  });

  it("renders QR placeholder area", () => {
    render(<CheckoutPage />);
    expect(screen.getByLabelText("QR Code")).toBeInTheDocument();
  });

  it("shows reference code", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("รหัส: #KG-2026-7842")).toBeInTheDocument();
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

  it("confirm button contains ยืนยันการชำระเงิน", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("✓ ยืนยันการชำระเงิน")).toBeInTheDocument();
  });

  it("shows terms disclaimer", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("เมื่อกดยืนยัน ถือว่าคุณยอมรับเงื่อนไขการใช้บริการ")).toBeInTheDocument();
  });
});
