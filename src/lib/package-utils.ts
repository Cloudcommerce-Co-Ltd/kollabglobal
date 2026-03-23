import { PACKAGE_EXTRAS } from "@/lib/constants";

/** Calculates the total package price after discount. */
export function calculatePackageTotal(pkg: {
  numCreators: number;
  pricePerCreator: number;
  discountPct: number;
}): number {
  return Math.round(
    pkg.numCreators * pkg.pricePerCreator * (1 - pkg.discountPct / 100)
  );
}

/** Returns the platforms for a given package ID. */
export function getPackagePlatforms(packageId: number | undefined): string[] {
  return (packageId !== undefined ? PACKAGE_EXTRAS[packageId] : undefined)?.platforms ?? ["tiktok", "instagram"];
}

/** Returns the deliverables for a given package ID. */
export function getPackageDeliverables(packageId: number | undefined): string[] {
  return (
    (packageId !== undefined ? PACKAGE_EXTRAS[packageId] : undefined)?.deliverables ?? [
      "TikTok 1 วิดีโอ (30–60 วิ)",
      "IG 1 Reel + 3 Stories",
    ]
  );
}
