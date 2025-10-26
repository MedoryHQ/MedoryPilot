import { toUpperCase } from "@/lib/utils";

type TranslationItem = {
  language?: { code: string };
  languageId?: string;
  [key: string]: any;
};

const findTranslation = (
  translations: TranslationItem[] | undefined,
  languageId: string
) => {
  if (!Array.isArray(translations)) return undefined;
  return translations.find(
    (t) => t?.language?.code === languageId || t?.languageId === languageId
  );
};

export const getTranslatedField = (
  translations: TranslationItem[] | undefined,
  languageId: string,
  field: string,
  dontUpperCase = false,
  fallback = ""
): string => {
  const item = findTranslation(translations, languageId);
  const raw = item?.[field];

  if (raw == null) return fallback;
  if (typeof raw === "string") return dontUpperCase ? raw : toUpperCase(raw);
  return String(raw);
};

export const getTranslatedObject = <
  T extends Record<string, any> = Record<string, any>
>(
  translations: T[] | undefined,
  languageId: string,
  fallback: T = {} as T
): T => {
  if (!Array.isArray(translations)) return fallback;
  return (
    translations.find(
      (t) =>
        (t as any)?.language?.code === languageId ||
        (t as any)?.languageId === languageId
    ) || fallback
  );
};
