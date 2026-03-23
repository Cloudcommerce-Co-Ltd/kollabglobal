import { describe, it, expect } from "vitest";
import {
  calculatePackageTotal,
  calculateTotalWithFees,
  VAT_RATE,
  SERVICE_FEE_RATE,
} from "@/lib/package-utils";

describe("calculatePackageTotal", () => {
  it("calculates total as numCreators * price", () => {
    const result = calculatePackageTotal({ numCreators: 5, price: 2000 });
    expect(result).toBe(10000);
  });

  it("calculates total for larger package", () => {
    const result = calculatePackageTotal({ numCreators: 10, price: 3500 });
    expect(result).toBe(35000);
  });

  it("calculates total for value package", () => {
    const result = calculatePackageTotal({ numCreators: 15, price: 4800 });
    expect(result).toBe(72000);
  });
});

describe("VAT_RATE and SERVICE_FEE_RATE", () => {
  it("VAT_RATE is 7%", () => {
    expect(VAT_RATE).toBe(0.07);
  });

  it("SERVICE_FEE_RATE is 3%", () => {
    expect(SERVICE_FEE_RATE).toBe(0.03);
  });
});

describe("calculateTotalWithFees", () => {
  it("returns correct breakdown for 10 creators at 3500 each", () => {
    const result = calculateTotalWithFees({ numCreators: 10, price: 3500 });
    expect(result.basePrice).toBe(35000);
    expect(result.vat).toBe(2450);       // Math.round(35000 * 0.07)
    expect(result.serviceFee).toBe(1050); // Math.round(35000 * 0.03)
    expect(result.total).toBe(38500);
    expect(result.totalSatang).toBe(3850000);
  });

  it("rounds VAT and service fee correctly", () => {
    // base = 5 * 333 = 1665, vat = round(1665 * 0.07) = round(116.55) = 117
    const result = calculateTotalWithFees({ numCreators: 5, price: 333 });
    expect(result.basePrice).toBe(1665);
    expect(result.vat).toBe(117);
    expect(result.serviceFee).toBe(50); // round(1665 * 0.03) = round(49.95) = 50
    expect(result.total).toBe(1832);
    expect(result.totalSatang).toBe(183200);
  });

  it("totalSatang is total * 100 rounded", () => {
    const result = calculateTotalWithFees({ numCreators: 3, price: 1000 });
    expect(result.totalSatang).toBe(Math.round(result.total * 100));
  });
});
