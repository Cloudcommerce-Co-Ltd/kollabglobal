// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CheckoutPage from "../page";
import { SAMPLE_CREATOR_AVATARS } from "@/lib/constants";

describe("CheckoutPage", () => {
  it("renders title สรุปรายการ & ชำระเงิน", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("สรุปรายการ & ชำระเงิน")).toBeInTheDocument();
  });

  it("shows package name Popular", () => {
    render(<CheckoutPage />);
    expect(screen.getAllByText("Popular").length).toBeGreaterThan(0);
  });

  it("shows 10 creator avatars", () => {
    render(<CheckoutPage />);
    // Each avatar is rendered with title attribute equal to creator name
    for (const creator of SAMPLE_CREATOR_AVATARS.slice(0, 10)) {
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
