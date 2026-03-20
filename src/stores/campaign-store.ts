import { create } from "zustand";
import type { ProductData } from "@/types/campaign";

export type { ProductData };

interface CampaignCreationState {
  step: number;
  countryId: string | null;
  promotionType: "PRODUCT" | "SERVICE" | null;
  productData: ProductData | null;
  packageId: string | null;
  selectedCreatorIds: string[];
}

interface CampaignCreationActions {
  setCountry: (id: string) => void;
  setPromotionType: (type: "PRODUCT" | "SERVICE") => void;
  setProduct: (data: ProductData) => void;
  setPackage: (id: string) => void;
  setCreators: (ids: string[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
}

type CampaignStore = CampaignCreationState & CampaignCreationActions;

const initialState: CampaignCreationState = {
  step: 1,
  countryId: null,
  promotionType: null,
  productData: null,
  packageId: null,
  selectedCreatorIds: [],
};

export const useCampaignStore = create<CampaignStore>((set) => ({
  ...initialState,

  setCountry: (id) => set({ countryId: id }),
  setPromotionType: (type) => set({ promotionType: type }),
  setProduct: (data) => set({ productData: data }),
  setPackage: (id) => set({ packageId: id }),
  setCreators: (ids) => set({ selectedCreatorIds: ids }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  goToStep: (step) => set({ step }),
  reset: () => set(initialState),
}));
