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
export function getPackagePlatforms(packageId: string | undefined): string[] {
  return PACKAGE_EXTRAS[packageId ?? ""]?.platforms ?? ["tiktok", "instagram"];
}

/** Returns the deliverables for a given package ID. */
export function getPackageDeliverables(packageId: string | undefined): string[] {
  return (
    PACKAGE_EXTRAS[packageId ?? ""]?.deliverables ?? [
      "TikTok 1 วิดีโอ (30–60 วิ)",
      "IG 1 Reel + 3 Stories",
    ]
  );
}
