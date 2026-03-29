/** Package price is net — no additional VAT or service fee. */
export function calculateTotalWithFees(pkg: { price: number }): {
  basePrice: number;
  total: number;
  totalSatang: number;
} {
  const basePrice = pkg.price;
  return { basePrice, total: basePrice, totalSatang: basePrice * 100 };
}
