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
} from "@/generated/prisma/client";

// Client-safe enum type aliases
export type PromotionType = "PRODUCT" | "SERVICE";
export type CampaignStatus =
  | "DRAFT"
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";
export type CreatorStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
export type PaymentMethod = "CREDIT_CARD" | "BANK_TRANSFER" | "QR_CODE";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
