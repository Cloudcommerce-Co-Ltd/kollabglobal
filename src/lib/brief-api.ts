import type { CampaignWithRelations, ProductData } from "@/types/campaign";
import type { BriefForm, TranslatedFields } from "@/types/brief";
import type { BriefContent, TranslatedContent } from "@/lib/brief-utils";
import { buildFillBriefPayload, buildTranslatePayload } from "@/lib/brief-utils";

export async function fetchCampaign(id: string): Promise<CampaignWithRelations> {
  const res = await fetch(`/api/campaigns/${id}`);
  if (!res.ok) throw new Error("Campaign not found");
  return res.json() as Promise<CampaignWithRelations>;
}

export async function fillBriefAI(product: ProductData): Promise<Partial<BriefForm>> {
  const res = await fetch("/api/ai/fill-brief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildFillBriefPayload(product)),
  });
  if (!res.ok) throw new Error("AI fill failed");
  return res.json() as Promise<Partial<BriefForm>>;
}

export async function translateBrief(
  form: BriefForm,
  targetLang: { code: string; name: string }
): Promise<TranslatedFields> {
  const res = await fetch("/api/ai/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildTranslatePayload(form, targetLang)),
  });
  if (!res.ok) throw new Error("Translation failed");
  return res.json() as Promise<TranslatedFields>;
}

export async function publishBrief(
  campaignId: string,
  content: BriefContent,
  translated?: TranslatedContent
): Promise<boolean> {
  const res = await fetch(`/api/campaigns/${campaignId}/brief`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, translated }),
  });
  return res.ok;
}
