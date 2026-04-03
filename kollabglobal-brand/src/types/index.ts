import type { Creator } from "@/generated/prisma/client";

// Re-export Prisma generated types
export type {
  User,
  Account,
  Session,
  Country,
  Package,
  Creator,
  Campaign,
  CampaignProduct,
  CampaignBrief,
  CampaignCreator,
  Payment,
  PackageCreator,
} from "@/generated/prisma/client";

// Client-safe enum type aliases
export type PromotionType = "PRODUCT" | "SERVICE";
export type CampaignStatus =
  | "DRAFT"
  | "AWAITING_PAYMENT"
  | "PENDING"
  | "ACCEPTING"
  | "AWAITING_SHIPMENT"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";
export type CreatorStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
export type PaymentMethod = "CREDIT_CARD" | "BANK_TRANSFER" | "QR_CODE";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface CreatorWithPackageInfo extends Creator {
  isBackup: boolean;
  sortOrder: number;
}
