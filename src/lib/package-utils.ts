export const VAT_RATE = 0.07;
export const SERVICE_FEE_RATE = 0.03;

/** Calculates the total package price (base, before fees). */
export function calculatePackageTotal(pkg: {
  numCreators: number;
  price: number;
}): number {
  return pkg.numCreators * pkg.price;
}

/** Calculates the full price breakdown including VAT and service fee. */
export function calculateTotalWithFees(pkg: { numCreators: number; price: number }): {
  basePrice: number;
  vat: number;
  serviceFee: number;
  total: number;
  totalSatang: number;
} {
  const basePrice = calculatePackageTotal(pkg);
  const vat = Math.round(basePrice * VAT_RATE);
  const serviceFee = Math.round(basePrice * SERVICE_FEE_RATE);
  const total = basePrice + vat + serviceFee;
  return { basePrice, vat, serviceFee, total, totalSatang: Math.round(total * 100) };
}
