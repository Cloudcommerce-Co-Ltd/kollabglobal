import type { BriefForm } from "@/types/brief";
import type { ProductData } from "@/types/campaign";
import type { FillBriefInput } from "@/lib/validations/fill-brief";
import type { TranslateInput } from "@/lib/validations/translate";

export interface BriefContent {
  keys: string;
  dos: string;
  deliverables: string;
  disclosure: string;
  deadline: string;
  name: string;
}

export interface TranslatedContent {
  keys: string;
  dos: string;
  deliverables: string;
  disclosure: string;
  name: string;
}

export function prepareBriefContent(
  content: BriefContent,
  translated?: TranslatedContent
): { finalContent: string; contentTh: string | null } {
  const thaiContent = JSON.stringify(content);
  if (translated) {
    return { finalContent: JSON.stringify(translated), contentTh: thaiContent };
  }
  return { finalContent: thaiContent, contentTh: null };
}

/** Returns true when all required content fields are filled. */
export function isBriefContentFilled(form: BriefForm): boolean {
  return !!(form.keys && form.dos && form.deliverables && form.disclosure);
}

/**
 * Returns true when the brief is ready to publish.
 * @param form - current form state
 * @param needsTranslation - whether the target country requires translation
 * @param hasTranslation - whether translation has been completed
 */
export function canPublishBrief(
  form: BriefForm,
  needsTranslation: boolean,
  hasTranslation: boolean
): boolean {
  const contentFilled = isBriefContentFilled(form);
  const deadlineFilled = !!form.deadline;
  const translateDone = !needsTranslation || hasTranslation;
  return contentFilled && deadlineFilled && translateDone;
}

export interface FillBriefContext {
  countryName?: string;
  platforms?: string[];
  packageDeliverables?: string[];
}

/** Builds the payload for the fill-brief AI API call. */
export function buildFillBriefPayload(
  product: ProductData,
  context?: FillBriefContext
): FillBriefInput {
  return {
    brandName: product.brandName,
    productName: product.productName,
    category: product.category,
    description: product.description,
    sellingPoints: product.sellingPoints,
    isService: product.isService,
    url: product.url || undefined,
    ...(context?.countryName ? { countryName: context.countryName } : {}),
    ...(context?.platforms?.length ? { platforms: context.platforms } : {}),
    ...(context?.packageDeliverables?.length
      ? { packageDeliverables: context.packageDeliverables }
      : {}),
  };
}

/** Builds the payload for the translate AI API call. */
export function buildTranslatePayload(
  form: BriefForm,
  targetLang: { code: string; name: string }
): TranslateInput {
  return {
    fields: {
      keys: form.keys,
      dos: form.dos,
      deliverables: form.deliverables,
      disclosure: form.disclosure,
      name: form.name,
    },
    targetLang: targetLang.code,
    targetLangName: targetLang.name,
  };
}
