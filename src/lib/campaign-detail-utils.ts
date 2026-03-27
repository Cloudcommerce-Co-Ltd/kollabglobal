export type DisplayStatus = "awaiting_payment" | "brief" | "accepting" | "ship" | "active" | "live" | "cancelled";

type CampaignForStatus = { status: string; products?: Array<{ isService: boolean }> | null };

export function resolveDisplayStatus(campaign: CampaignForStatus): DisplayStatus {
  const isService = campaign.products?.[0]?.isService ?? false;
  switch (campaign.status) {
    case "AWAITING_PAYMENT":
      return "awaiting_payment";
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
    case "CANCELLED":
      return "cancelled";
    default:
      return "cancelled";
  }
}

export interface StatusBadge {
  label: string;
  cls: string;
}

export function getStatusBadge(displayStatus: DisplayStatus): StatusBadge {
  switch (displayStatus) {
    case "awaiting_payment":
      return { label: "รอชำระเงิน", cls: "bg-[#fee2e2] text-[#dc2626]" };
    case "brief":
      return { label: "ต้องสร้าง Brief", cls: "bg-warning-bg text-amber-700" };
    case "accepting":
      return { label: "รอตอบรับ", cls: "bg-[#fef9ec] text-warning-text" };
    case "ship":
      return { label: "รอส่งสินค้า", cls: "bg-red-100 text-red-600" };
    case "active":
      return { label: "กำลังดำเนินการ", cls: "bg-brand-light text-brand" };
    case "live":
      return { label: "Live", cls: "bg-brand-light text-teal-700" };
    case "cancelled":
      return { label: "ยกเลิก", cls: "bg-[#f0f0f0] text-muted-text" };
  }
}
