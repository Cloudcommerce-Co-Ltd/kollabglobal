export const VAT_RATE = 0.07;
export const SERVICE_FEE_RATE = 0.03;

/** Calculates the full price breakdown including VAT and service fee. */
export function calculateTotalWithFees(pkg: { price: number }): {
  basePrice: number;
  vat: number;
  serviceFee: number;
  total: number;
  totalSatang: number;
} {
  const basePrice = pkg.price;
  const vat = Math.round(basePrice * VAT_RATE);
  const serviceFee = Math.round(basePrice * SERVICE_FEE_RATE);
  const total = basePrice + vat + serviceFee;
  return { basePrice, vat, serviceFee, total, totalSatang: Math.round(total * 100) };
}
