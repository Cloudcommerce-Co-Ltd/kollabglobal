import { create } from "zustand";
import type { ProductData } from "@/types/campaign";
import { Country, Creator, Package } from "@/types";

export type { ProductData };

interface CampaignCreationState {
  countryData: Country | null;
  promotionType: "PRODUCT" | "SERVICE" | null;
  productData: ProductData | null;
  packageData: Package | null;
  selectedCreatorsData: Creator[];
}

interface CampaignCreationActions {
  setCountry: (data: Country) => void;
  setPromotionType: (type: "PRODUCT" | "SERVICE") => void;
  setProduct: (data: ProductData) => void;
  setPackage: (data: Package) => void;
  setCreators: (data: Creator[]) => void;
  reset: () => void;
}

type CampaignStore = CampaignCreationState & CampaignCreationActions;

const initialState: CampaignCreationState = {
  countryData: null,
  promotionType: null,
  productData: null,
  packageData: null,
  selectedCreatorsData: [],
};

export const useCampaignStore = create<CampaignStore>((set) => ({
  ...initialState,

  setCountry: (data) => set({ countryData: data }),
  setPromotionType: (type) => set({ promotionType: type }),
  setProduct: (data) => set({ productData: data }),
  setPackage: (data) => set({ packageData: data }),
  setCreators: (data) => set({ selectedCreatorsData: data }),
  reset: () => set(initialState),
}));
