// Brief form state used in the UI (matches BriefContent shape)
export interface BriefForm {
  name: string;
  keys: string;
  dos: string;
  deliverables: string;
  disclosure: string;
  deadline: string;
}

// Translated fields sent to creators in their language (matches TranslatedContent shape)
export interface TranslatedFields {
  keys: string;
  dos: string;
  deliverables: string;
  disclosure: string;
  name: string;
}
