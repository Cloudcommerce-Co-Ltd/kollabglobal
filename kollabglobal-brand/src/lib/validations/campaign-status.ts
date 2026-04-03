import { z } from "zod";

export const campaignStatusSchema = z.object({
  status: z.enum(["ACCEPTING", "AWAITING_SHIPMENT", "ACTIVE", "COMPLETED"]),
});

export type CampaignStatusInput = z.infer<typeof campaignStatusSchema>;

// Legal transitions: key = current status, value = allowed next statuses
export const LEGAL_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["ACCEPTING"],
  ACCEPTING: ["AWAITING_SHIPMENT", "ACTIVE"],
  AWAITING_SHIPMENT: ["ACTIVE"],
  ACTIVE: ["COMPLETED"],
};
