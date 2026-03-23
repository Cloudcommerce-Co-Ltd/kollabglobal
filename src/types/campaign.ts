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

export interface CampaignWithRelations {
  id: string;
  countryId: number;
  packageId: number;
  status: string;
  product: ProductData | null;
  country?: { id: number; name: string; flag: string } | null;
  package?: { id: number; name: string } | null;
  brief?: {
    id: string;
    content: string;
    contentTh: string | null;
    createdAt: string;
  } | null;
}
