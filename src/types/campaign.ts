import type { CampaignStatus, CreatorStatus, PromotionType } from "@/types/index";

export interface ProductData {
  brandName: string;
  productName: string;
  category: string;
  description: string;
  sellingPoints: string;
  url: string;
  imageUrl: string;
  isService: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

export interface CampaignListItem {
  id: string;
  promotionType: PromotionType;
  status: CampaignStatus;
  createdAt: string;
  country: { id: number; name: string; flag: string } | null;
  package: { id: number; name: string; numCreators: number; platforms: string[] } | null;
  product: {
    brandName: string;
    productName: string;
    isService: boolean;
    imageUrl: string | null;
  } | null;
  creators: Array<{ status: CreatorStatus }>;
}

export interface CampaignWithRelations {
  id: string;
  countryId: number;
  packageId: number;
  status: string;
  product: ProductData | null;
  country?: { id: number; name: string; flag: string; languageCode: string; languageName: string } | null;
  package?: { id: number; name: string; platforms: string[]; deliverables: string[] } | null;
  brief?: {
    id: string;
    content: string;
    contentTh: string | null;
    createdAt: string;
  } | null;
}
