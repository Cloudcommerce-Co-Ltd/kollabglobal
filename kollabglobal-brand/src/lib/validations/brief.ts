import { z } from "zod";

const briefContentSchema = z.object({
  name: z.string().min(1),
  keys: z.string().min(1),
  dos: z.string().min(1),
  deliverables: z.string().min(1),
  disclosure: z.string().min(1),
  deadline: z.string().min(1),
});

const translatedContentSchema = z.object({
  keys: z.string(),
  dos: z.string(),
  deliverables: z.string(),
  disclosure: z.string(),
  name: z.string(),
});

export const briefSubmitSchema = z.object({
  content: briefContentSchema,
  translated: translatedContentSchema.optional(),
});

export type BriefSubmitInput = z.infer<typeof briefSubmitSchema>;
