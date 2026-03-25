// All DB-sourced constants (categories, country language/region, package platforms/deliverables)
// have been moved to the database. Fetch them from their respective API routes:
//   GET /api/categories?type=product|service
//   Country.region, Country.languageCode, Country.languageName
//   Package.platforms, Package.deliverables

import type { CampaignStatus } from "@/types/index";

export const CAMPAIGN_STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; pillClass: string; sortOrder: number }
> = {
  DRAFT:             { label: "ร่างแคมเปญ",      pillClass: "bg-[#f0f0f0] text-muted-text",          sortOrder: 0 },
  AWAITING_PAYMENT:  { label: "รอชำระเงิน",      pillClass: "bg-[#fee2e2] text-[#dc2626]",           sortOrder: 1 },
  PENDING:           { label: "รอดำเนินการ",     pillClass: "bg-warning-bg text-[#b45309]",           sortOrder: 2 },
  ACCEPTING:         { label: "รอตอบรับ",         pillClass: "bg-warning-bg text-warning-text",        sortOrder: 3 },
  AWAITING_SHIPMENT: { label: "รอส่งสินค้า",     pillClass: "bg-[#fee2e2] text-[#dc2626]",           sortOrder: 4 },
  ACTIVE:            { label: "กำลังดำเนินการ",  pillClass: "bg-secondary-brand-light text-secondary-brand", sortOrder: 5 },
  COMPLETED:         { label: "Live",               pillClass: "bg-brand-light text-[#0d9488]",          sortOrder: 6 },
  CANCELLED:         { label: "ยกเลิก",           pillClass: "bg-[#f0f0f0] text-muted-text",          sortOrder: 7 },
};

export const CAMPAIGN_STATUS_TABS: Array<{ key: "all" | CampaignStatus; label: string }> = [
  { key: "all",               label: "ทั้งหมด" },
  { key: "AWAITING_PAYMENT",  label: "รอชำระเงิน" },
  { key: "PENDING",           label: "รอดำเนินการ" },
  { key: "ACCEPTING",         label: "รอตอบรับ" },
  { key: "AWAITING_SHIPMENT", label: "รอส่งสินค้า" },
  { key: "ACTIVE",            label: "กำลังดำเนินการ" },
  { key: "COMPLETED",         label: "Live" },
];
