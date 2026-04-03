import { describe, it, expect } from "vitest";
import { calculateTotalWithFees } from "@/lib/package-utils";

describe("calculateTotalWithFees", () => {
  it("returns basePrice as total (net price — no VAT or service fee)", () => {
    const result = calculateTotalWithFees({ price: 33250 });
    expect(result.basePrice).toBe(33250);
    expect(result.total).toBe(33250);
    expect(result.totalSatang).toBe(3325000);
  });

  it("totalSatang is basePrice * 100", () => {
    const result = calculateTotalWithFees({ price: 12500 });
    expect(result.totalSatang).toBe(1250000);
  });

  it("handles zero price", () => {
    const result = calculateTotalWithFees({ price: 0 });
    expect(result.total).toBe(0);
    expect(result.totalSatang).toBe(0);
  });
});
