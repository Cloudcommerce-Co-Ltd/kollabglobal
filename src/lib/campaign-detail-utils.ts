import type { CampaignWithRelations } from "@/types/campaign";

export type DisplayStatus = "brief" | "accepting" | "ship" | "active" | "live";

export function resolveDisplayStatus(campaign: CampaignWithRelations): DisplayStatus {
  const isService = campaign.product?.isService ?? false;
  switch (campaign.status) {
    case "DRAFT":
    case "AWAITING_PAYMENT":
    case "PENDING":
      return "brief";
    case "ACCEPTING":
      return "accepting";
    case "AWAITING_SHIPMENT":
      return isService ? "active" : "ship";
    case "ACTIVE":
      return "active";
    case "COMPLETED":
      return "live";
    default:
      return "brief";
  }
}

export interface StatusBadge {
  label: string;
  bgColor: string;
  textColor: string;
}

export function getStatusBadge(displayStatus: DisplayStatus): StatusBadge {
  switch (displayStatus) {
    case "brief":
      return { label: "ต้องสร้าง Brief", bgColor: "#fef3c7", textColor: "#b45309" };
    case "accepting":
      return { label: "รอตอบรับ", bgColor: "#fef9ec", textColor: "#d97706" };
    case "ship":
      return { label: "รอส่งสินค้า", bgColor: "#fee2e2", textColor: "#dc2626" };
    case "active":
      return { label: "กำลังดำเนินการ", bgColor: "#e8f8f7", textColor: "#4ECDC4" };
    case "live":
      return { label: "Live", bgColor: "#e8f8f7", textColor: "#0d9488" };
  }
}
