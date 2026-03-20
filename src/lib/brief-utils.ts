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
