/** Calculates the total package price. */
export function calculatePackageTotal(pkg: {
  numCreators: number;
  price: number;
}): number {
  return pkg.numCreators * pkg.price;
}

/** Returns the platforms for a given package. */
export function getPackagePlatforms(pkg: { platforms: string[] } | null | undefined): string[] {
  return pkg?.platforms ?? ['tiktok', 'instagram'];
}

/** Returns the deliverables for a given package. */
export function getPackageDeliverables(pkg: { deliverables: string[] } | null | undefined): string[] {
  return pkg?.deliverables ?? [
    'TikTok 1 วิดีโอ (30–60 วิ)',
    'IG 1 Reel + 3 Stories',
  ];
}
