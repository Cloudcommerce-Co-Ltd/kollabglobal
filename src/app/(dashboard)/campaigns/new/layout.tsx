"use client";

import { useEffect, useState } from "react";
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

  // Zustand persist uses sessionStorage which is only available client-side.
  // We must wait for hydration before running the step guard, otherwise the
  // server-rendered initial state (all null) triggers a spurious redirect.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Intentional: marks client hydration complete so the step guard
    // doesn't redirect based on empty Zustand state from SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const step = getStepFromPathname(pathname);
  const result = validateStep(step, {
    countryData,
    productData,
    packageData,
    selectedCreatorsData,
  });

  useEffect(() => {
    if (!hydrated) return;
    if (!result.allowed) {
      router.replace(result.redirectTo);
    }
  }, [hydrated, result, router]);

  // While hydrating, show nothing to avoid flash of wrong content.
  if (!hydrated) {
    return <div className="min-h-screen bg-surface" />;
  }

  if (!result.allowed) {
    return null;
  }

  return <div className="min-h-screen bg-surface">{children}</div>;
}
