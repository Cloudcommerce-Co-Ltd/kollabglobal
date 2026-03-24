export type DisplayStatus = "brief" | "accepting" | "ship" | "active" | "live";

type CampaignForStatus = { status: string; product?: { isService: boolean } | null };

export function resolveDisplayStatus(campaign: CampaignForStatus): DisplayStatus {
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
  cls: string;
}

export function getStatusBadge(displayStatus: DisplayStatus): StatusBadge {
  switch (displayStatus) {
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
  }
}
