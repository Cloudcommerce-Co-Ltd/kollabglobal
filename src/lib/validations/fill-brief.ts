import { z } from "zod";

export const fillBriefSchema = z.object({
  brandName: z.string().min(1),
  productName: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  sellingPoints: z.string().min(1),
  isService: z.boolean(),
  url: z.string().optional(),
  countryName: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  packageDeliverables: z.array(z.string()).optional(),
});

export type FillBriefInput = z.infer<typeof fillBriefSchema>;
