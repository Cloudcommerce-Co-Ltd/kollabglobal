import { describe, it, expect, beforeEach } from "vitest";
import { useCampaignStore } from "@/stores/campaign-store";

describe("Campaign creation flow — store integration", () => {
  beforeEach(() => {
    useCampaignStore.getState().reset();
  });

  it("starts at step 1 with no selections", () => {
    const state = useCampaignStore.getState();
    expect(state.step).toBe(1);
    expect(state.countryId).toBeNull();
    expect(state.packageId).toBeNull();
  });

  it("step 1: setCountry then nextStep advances to step 2", () => {
    const store = useCampaignStore.getState();
    store.setCountry("thailand");
    expect(useCampaignStore.getState().countryId).toBe("thailand");
    store.nextStep();
    expect(useCampaignStore.getState().step).toBe(2);
  });

  it("step 3: goToStep(3) then setPackage sets packageId", () => {
    const store = useCampaignStore.getState();
    store.setCountry("thailand");
    store.goToStep(3);
    expect(useCampaignStore.getState().step).toBe(3);
    store.setPackage("popular");
    expect(useCampaignStore.getState().packageId).toBe("popular");
  });

  it("full country → package flow advances step correctly", () => {
    const store = useCampaignStore.getState();

    // Step 1: select country
    store.setCountry("vietnam");
    expect(useCampaignStore.getState().countryId).toBe("vietnam");

    // Advance to step 2
    store.nextStep();
    expect(useCampaignStore.getState().step).toBe(2);

    // Jump to step 3 (package)
    store.goToStep(3);
    expect(useCampaignStore.getState().step).toBe(3);

    // Select package
    store.setPackage("popular");
    expect(useCampaignStore.getState().packageId).toBe("popular");

    // Advance to step 4
    store.nextStep();
    expect(useCampaignStore.getState().step).toBe(4);
  });

  it("countryId persists across goToStep calls", () => {
    const store = useCampaignStore.getState();
    store.setCountry("malaysia");
    store.goToStep(3);
    expect(useCampaignStore.getState().countryId).toBe("malaysia");
  });

  it("packageId guard: countryId must be set before package selection makes sense", () => {
    // This test documents the expected guard behavior at store level
    const state = useCampaignStore.getState();
    expect(state.countryId).toBeNull();
    // Setting a package without a country is technically allowed in store,
    // but the page component redirects when countryId is null
    state.setPackage("starter");
    expect(useCampaignStore.getState().packageId).toBe("starter");
    expect(useCampaignStore.getState().countryId).toBeNull();
  });
});
