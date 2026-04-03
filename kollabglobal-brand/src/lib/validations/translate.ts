import { z } from "zod";

export const translateSchema = z.object({
  fields: z.record(z.string(), z.string()),
  targetLang: z.string().min(1),
  targetLangName: z.string().min(1),
});

export type TranslateInput = z.infer<typeof translateSchema>;
