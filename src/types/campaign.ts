import type {
  CampaignStatus,
  CreatorStatus,
  PromotionType,
} from '@/types/index';

export interface ProductData {
  brandName: string;
  productName: string;
  category: string;
  description: string;
  sellingPoints: string;
  url: string;
  imageUrl: string | null;
  isService: boolean;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface CampaignListItem {
  id: string;
  promotionType: PromotionType;
  status: CampaignStatus;
  createdAt: string;
  country: { id: number; name: string; countryCode: string } | null;
  package: {
    id: number;
    name: string;
    numCreators: number;
    platforms: string[];
  } | null;
  product: {
    brandName: string;
    productName: string;
    isService: boolean;
    imageUrl: string | null;
  } | null;
  creators: Array<{ status: CreatorStatus }>;
}

export interface CampaignCreatorWithRelation {
  id: string;
  status: string;
  contentStatus: string;
  creator: {
    id: string;
    name: string;
    niche: string;
    engagement: string;
    reach: string;
    avatar: string;
    countryCode: string | null;
    platform: string | null;
    socialHandle: string | null;
  };
}

export interface CampaignWithRelations {
  id: string;
  countryId: number;
  packageId: number;
  promotionType: string;
  status: string;
  duration: number;
  product: ProductData | null;
  country?: {
    id: number;
    name: string;
    countryCode: string;
    languageCode: string;
    languageName: string;
  } | null;
  package?: {
    id: number;
    name: string;
    platforms: string[];
    deliverables: string[];
    numCreators: number;
  } | null;
  brief?: {
    id: string;
    content: string;
    contentTh: string | null;
    publishedAt: string | null;
    createdAt: string;
  } | null;
  creators?: CampaignCreatorWithRelation[];
}
