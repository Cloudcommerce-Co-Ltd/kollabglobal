// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddProductPage from "../page";
import { useCampaignStore } from "@/stores/campaign-store";

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

vi.mock("@/hooks/use-image-upload", () => ({
  useImageUpload: () => ({
    imageUrl: null,
    uploading: false,
    error: null,
    handleFileSelect: vi.fn(),
    reset: vi.fn(),
  }),
}));

beforeEach(() => {
  useCampaignStore.getState().reset();
  useCampaignStore.getState().setCountry("thailand");
  mockPush.mockClear();
  mockReplace.mockClear();
});

describe("AddProductPage", () => {
  it("calls goToStep(2) on mount", () => {
    useCampaignStore.getState().goToStep(1);
    render(<AddProductPage />);
    expect(useCampaignStore.getState().step).toBe(2);
  });

  it("redirects to country page if countryId is null", () => {
    useCampaignStore.getState().reset();
    render(<AddProductPage />);
    expect(mockReplace).toHaveBeenCalledWith("/campaigns/new/country");
  });

  it("renders promotion type selector", () => {
    render(<AddProductPage />);
    expect(screen.getByText("สินค้า")).toBeInTheDocument();
    expect(screen.getByText("บริการ")).toBeInTheDocument();
  });

  it("shows product categories after clicking สินค้า", () => {
    render(<AddProductPage />);
    fireEvent.click(screen.getByText("สินค้า").closest("button")!);
    expect(screen.getByText("Food & Snack")).toBeInTheDocument();
    expect(screen.getByText("Beauty & Skincare")).toBeInTheDocument();
  });

  it("shows service categories and no-shipping banner after clicking บริการ", () => {
    render(<AddProductPage />);
    fireEvent.click(screen.getByText("บริการ").closest("button")!);
    expect(screen.getByText("ร้านอาหาร / คาเฟ่")).toBeInTheDocument();
    expect(screen.getByText("ไม่ต้องจัดส่งสินค้า")).toBeInTheDocument();
  });

  it("switching from product to service resets category", () => {
    render(<AddProductPage />);
    fireEvent.click(screen.getByText("สินค้า").closest("button")!);
    fireEvent.click(screen.getByText("Food & Snack"));

    fireEvent.click(screen.getByText("บริการ").closest("button")!);
    expect(screen.queryByText("Food & Snack")).not.toBeInTheDocument();
  });

  it("CTA is disabled when required fields are empty", () => {
    render(<AddProductPage />);
    expect(screen.getByText("ยืนยัน — ถัดไป")).toBeDisabled();
  });

  it("CTA is enabled when all required fields filled", () => {
    render(<AddProductPage />);
    fireEvent.click(screen.getByText("สินค้า").closest("button")!);

    fireEvent.change(screen.getByPlaceholderText(/KOLLAB|FitLife|The Table/i), {
      target: { value: "My Brand" },
    });
    fireEvent.change(screen.getByPlaceholderText(/มะม่วงอบแห้ง/), {
      target: { value: "My Product" },
    });
    fireEvent.click(screen.getByText("Food & Snack"));

    expect(screen.getByText("ยืนยัน — ถัดไป")).not.toBeDisabled();
  });

  it("submit calls store actions and navigates to package page", () => {
    render(<AddProductPage />);
    fireEvent.click(screen.getByText("สินค้า").closest("button")!);

    fireEvent.change(screen.getByPlaceholderText(/KOLLAB|FitLife|The Table/i), {
      target: { value: "My Brand" },
    });
    fireEvent.change(screen.getByPlaceholderText(/มะม่วงอบแห้ง/), {
      target: { value: "My Product" },
    });
    fireEvent.click(screen.getByText("Food & Snack"));
    fireEvent.click(screen.getByText("ยืนยัน — ถัดไป"));

    const state = useCampaignStore.getState();
    expect(state.promotionType).toBe("PRODUCT");
    expect(state.productData?.brandName).toBe("My Brand");
    expect(state.productData?.productName).toBe("My Product");
    expect(state.productData?.category).toBe("Food & Snack");
    expect(mockPush).toHaveBeenCalledWith("/campaigns/new/package");
  });

  it("back button navigates to country page", () => {
    render(<AddProductPage />);
    fireEvent.click(screen.getByText("กลับไปเลือกตลาด"));
    expect(mockPush).toHaveBeenCalledWith("/campaigns/new/country");
  });

  it("shipping fields visible only for product type", () => {
    render(<AddProductPage />);
    fireEvent.click(screen.getByText("สินค้า").closest("button")!);
    expect(screen.getByText("ข้อมูลจัดส่ง")).toBeInTheDocument();

    fireEvent.click(screen.getByText("บริการ").closest("button")!);
    expect(screen.queryByText("ข้อมูลจัดส่ง")).not.toBeInTheDocument();
  });

  it("image upload area is present", () => {
    render(<AddProductPage />);
    fireEvent.click(screen.getByText("สินค้า").closest("button")!);
    expect(screen.getByText("คลิกเพื่ออัปโหลดรูป")).toBeInTheDocument();
  });

  it("pre-populates form from existing store data", () => {
    useCampaignStore.getState().setPromotionType("PRODUCT");
    useCampaignStore.getState().setProduct({
      brandName: "Existing Brand",
      productName: "Existing Product",
      category: "Fashion",
      description: "Test desc",
      sellingPoints: "",
      url: "",
      imageUrl: "",
      isService: false,
    });

    render(<AddProductPage />);

    expect(
      (screen.getByPlaceholderText(/KOLLAB|FitLife|The Table/i) as HTMLInputElement).value
    ).toBe("Existing Brand");
    expect(
      (screen.getByPlaceholderText(/มะม่วงอบแห้ง/) as HTMLInputElement).value
    ).toBe("Existing Product");
  });
});
