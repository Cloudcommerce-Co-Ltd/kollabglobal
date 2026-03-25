"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCampaignStore } from "@/stores/campaign-store";
import { getStepFromPathname, validateStep } from "@/lib/campaign-steps";

export default function CampaignNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { countryData, productData, packageData, selectedCreatorsData } =
    useCampaignStore();

  const step = getStepFromPathname(pathname);
  const result = validateStep(step, {
    countryData,
    productData,
    packageData,
    selectedCreatorsData,
  });

  useEffect(() => {
    if (!result.allowed) {
      router.replace(result.redirectTo);
    }
  }, [result, router]);

  if (!result.allowed) {
    return null;
  }

  return <div className="min-h-screen bg-surface">{children}</div>;
}
