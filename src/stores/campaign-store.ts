import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProductData } from "@/types/campaign";
import { Country, Package, CreatorWithPackageInfo } from "@/types";

export type { ProductData };

type DraftStatus = "idle" | "draft" | "checkout";

interface CampaignCreationState {
  status: DraftStatus;
  countryData: Country | null;
  promotionType: "PRODUCT" | "SERVICE" | null;
  productData: ProductData | null;
  packageData: Package | null;
  selectedCreatorsData: CreatorWithPackageInfo[];
  // Checkout state — persisted so refresh during QR polling doesn't create duplicate charge
  chargeId: string | null;
  campaignId: string | null;
  qrCodeUrl: string | null;
  chargeCreatedAt: number | null; // unix ms — used to restore countdown after refresh
}

interface CampaignCreationActions {
  setCountry: (data: Country) => void;
  setPromotionType: (type: "PRODUCT" | "SERVICE") => void;
  setProduct: (data: ProductData) => void;
  setPackage: (data: Package) => void;
  setCreators: (data: CreatorWithPackageInfo[]) => void;
  setCheckoutData: (chargeId: string, campaignId: string, qrCodeUrl: string) => void;
  clearCheckoutData: () => void;
  reset: () => void;
}

type CampaignStore = CampaignCreationState & CampaignCreationActions;

const initialState: CampaignCreationState = {
  status: "idle",
  countryData: null,
  promotionType: null,
  productData: null,
  packageData: null,
  selectedCreatorsData: [],
  chargeId: null,
  campaignId: null,
  qrCodeUrl: null,
  chargeCreatedAt: null,
};

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCountry: (data) => set({ countryData: data, status: "draft" }),
      setPromotionType: (type) => set({ promotionType: type }),
      setProduct: (data) => set({ productData: data }),
      setPackage: (data) => set({ packageData: data }),
      setCreators: (data) => set({ selectedCreatorsData: data }),
      setCheckoutData: (chargeId, campaignId, qrCodeUrl) =>
        set({ chargeId, campaignId, qrCodeUrl, chargeCreatedAt: Date.now(), status: "checkout" }),
      clearCheckoutData: () =>
        set({ chargeId: null, campaignId: null, qrCodeUrl: null, chargeCreatedAt: null, status: "draft" }),
      reset: () => set(initialState),
    }),
    {
      name: "kollab-campaign-draft",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          // SSR or Node.js test environment — use a no-op storage so the store
          // still initialises without errors (persist just won't save anything).
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          } as unknown as Storage;
        }
        return window.sessionStorage;
      }),
    }
  )
);
