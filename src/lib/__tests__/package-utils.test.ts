import { describe, it, expect } from "vitest";
import {
  calculateTotalWithFees,
  VAT_RATE,
  SERVICE_FEE_RATE,
} from "@/lib/package-utils";

describe("VAT_RATE and SERVICE_FEE_RATE", () => {
  it("VAT_RATE is 7%", () => {
    expect(VAT_RATE).toBe(0.07);
  });

  it("SERVICE_FEE_RATE is 3%", () => {
    expect(SERVICE_FEE_RATE).toBe(0.03);
  });
});

describe("calculateTotalWithFees", () => {
  it("returns correct breakdown for package with price 33250", () => {
    // base = 33250, vat = round(33250 * 0.07) = 2328, serviceFee = round(33250 * 0.03) = 998
    const result = calculateTotalWithFees({ numCreators: 10, price: 33250 });
    expect(result.basePrice).toBe(33250);
    expect(result.vat).toBe(Math.round(33250 * 0.07));
    expect(result.serviceFee).toBe(Math.round(33250 * 0.03));
    expect(result.total).toBe(33250 + Math.round(33250 * 0.07) + Math.round(33250 * 0.03));
    expect(result.totalSatang).toBe(Math.round(result.total * 100));
  });

  it("rounds VAT and service fee correctly", () => {
    // base = 1665, vat = round(1665 * 0.07) = round(116.55) = 117
    const result = calculateTotalWithFees({ numCreators: 5, price: 1665 });
    expect(result.basePrice).toBe(1665);
    expect(result.vat).toBe(117);
    expect(result.serviceFee).toBe(50); // round(1665 * 0.03) = round(49.95) = 50
    expect(result.total).toBe(1832);
    expect(result.totalSatang).toBe(183200);
  });

  it("totalSatang is total * 100 rounded", () => {
    const result = calculateTotalWithFees({ numCreators: 3, price: 12500 });
    expect(result.totalSatang).toBe(Math.round(result.total * 100));
  });
});
