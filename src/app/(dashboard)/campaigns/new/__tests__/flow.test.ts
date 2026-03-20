import { describe, it, expect, beforeEach } from "vitest";
import { useCampaignStore } from "@/stores/campaign-store";
import type { Country, Package } from "@/types";

const mkCountry = (id: string, name: string): Country => ({
  id, name, flag: '🏳️', creatorsAvail: 0,
  avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null,
  snackTrend: null, platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
});

const mkPackage = (id: string, name: string): Package => ({
  id, name, badge: null,
  numCreators: 10, pricePerCreator: 3500, discountPct: 0,
  estReach: null, estEngagement: null,
});

describe("Campaign creation flow — store integration", () => {
  beforeEach(() => {
    useCampaignStore.getState().reset();
  });

  it("starts at step 1 with no selections", () => {
    const state = useCampaignStore.getState();
    expect(state.step).toBe(1);
    expect(state.countryData).toBeNull();
    expect(state.packageData).toBeNull();
  });

  it("step 1: setCountry then nextStep advances to step 2", () => {
    const store = useCampaignStore.getState();
    store.setCountry(mkCountry("thailand", "Thailand"));
    expect(useCampaignStore.getState().countryData?.id).toBe("thailand");
    store.nextStep();
    expect(useCampaignStore.getState().step).toBe(2);
  });

  it("step 3: goToStep(3) then setPackage sets packageData", () => {
    const store = useCampaignStore.getState();
    store.setCountry(mkCountry("thailand", "Thailand"));
    store.goToStep(3);
    expect(useCampaignStore.getState().step).toBe(3);
    store.setPackage(mkPackage("popular", "Popular"));
    expect(useCampaignStore.getState().packageData?.id).toBe("popular");
  });

  it("full country → package flow advances step correctly", () => {
    const store = useCampaignStore.getState();

    // Step 1: select country
    store.setCountry(mkCountry("vietnam", "Vietnam"));
    expect(useCampaignStore.getState().countryData?.id).toBe("vietnam");

    // Advance to step 2
    store.nextStep();
    expect(useCampaignStore.getState().step).toBe(2);

    // Jump to step 3 (package)
    store.goToStep(3);
    expect(useCampaignStore.getState().step).toBe(3);

    // Select package
    store.setPackage(mkPackage("popular", "Popular"));
    expect(useCampaignStore.getState().packageData?.id).toBe("popular");

    // Advance to step 4
    store.nextStep();
    expect(useCampaignStore.getState().step).toBe(4);
  });

  it("countryData persists across goToStep calls", () => {
    const store = useCampaignStore.getState();
    store.setCountry(mkCountry("malaysia", "Malaysia"));
    store.goToStep(3);
    expect(useCampaignStore.getState().countryData?.id).toBe("malaysia");
  });

  it("packageData guard: countryData must be set before package selection makes sense", () => {
    // This test documents the expected guard behavior at store level
    const state = useCampaignStore.getState();
    expect(state.countryData).toBeNull();
    // Setting a package without a country is technically allowed in store,
    // but the page component redirects when countryData is null
    state.setPackage(mkPackage("starter", "Starter"));
    expect(useCampaignStore.getState().packageData?.id).toBe("starter");
    expect(useCampaignStore.getState().countryData).toBeNull();
  });
});
