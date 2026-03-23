import { z } from "zod";

export const campaignUpdateSchema = z.object({
  status: z.enum(["DRAFT", "PENDING_PAYMENT", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  countryId: z.number().int().optional(),
  packageId: z.number().int().optional(),
  promotionType: z.enum(["PRODUCT", "SERVICE"]).optional(),
});

export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
