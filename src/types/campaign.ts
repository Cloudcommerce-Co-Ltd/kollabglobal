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
  countryId: string;
  packageId: string;
  status: string;
  product: ProductData | null;
  country?: { id: string; name: string; flag: string } | null;
  package?: { id: string; name: string } | null;
  brief?: {
    id: string;
    content: string;
    contentTh: string | null;
    createdAt: string;
  } | null;
}
