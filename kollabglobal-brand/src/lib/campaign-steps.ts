import type { Country, Package, CreatorWithPackageInfo } from "@/types";
import type { ProductData } from "@/types/campaign";

export const STEP_ROUTES = [
  { path: "country",  step: 1, label: "ตลาด",       labelEn: "Country" },
  { path: "product",  step: 2, label: "สินค้า",      labelEn: "Product" },
  { path: "package",  step: 3, label: "แพ็กเกจ",     labelEn: "Package" },
  { path: "creators", step: 4, label: "ครีเอเตอร์",  labelEn: "Creators" },
  { path: "checkout", step: 5, label: "ชำระเงิน",    labelEn: "Checkout" },
] as const;

export function getStepFromPathname(pathname: string): number | null {
  for (const route of STEP_ROUTES) {
    if (pathname.endsWith(`/campaigns/new/${route.path}`)) {
      return route.step;
    }
  }
  return null;
}

interface GuardState {
  countryData: Country | null;
  productData: ProductData | null;
  packageData: Package | null;
  selectedCreatorsData: CreatorWithPackageInfo[];
}

export function validateStep(
  step: number | null,
  state: GuardState,
): { allowed: true } | { allowed: false; redirectTo: string } {
  const base = "/campaigns/new";

  if (step === null) return { allowed: true };

  if (step >= 2 && !state.countryData) {
    return { allowed: false, redirectTo: `${base}/country` };
  }
  if (step >= 3 && !state.productData) {
    return { allowed: false, redirectTo: `${base}/product` };
  }
  if (step >= 4 && !state.packageData) {
    return { allowed: false, redirectTo: `${base}/package` };
  }
  if (step >= 5 && state.selectedCreatorsData.length === 0) {
    return { allowed: false, redirectTo: `${base}/creators` };
  }

  return { allowed: true };
}
