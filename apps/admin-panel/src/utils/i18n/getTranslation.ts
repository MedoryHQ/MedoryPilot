import { toUpperCase } from "./";

export const getTranslatedField = (
  translations: { languageId: string; [key: string]: any }[] | undefined,
  languageId: string,
  field: string,
  dontUpperCase: boolean = false,
  fallback: string = ""
): string => {
  if (!Array.isArray(translations)) {
    return fallback;
  }

  const value =
    translations?.find((t) => t.language.code === languageId)?.[field] ||
    fallback;

  return dontUpperCase ? value : toUpperCase(value);
};

export const getTranslatedObject = (
  translations: { [key: string]: any }[] | undefined,
  languageId: string,
  fallback: { [key: string]: any } = {}
): { [key: string]: any } => {
  if (!Array.isArray(translations)) {
    return fallback;
  }

  return translations?.find((t) => t.language.code === languageId) || fallback;
};
