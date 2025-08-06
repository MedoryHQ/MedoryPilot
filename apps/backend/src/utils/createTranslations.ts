import { Translations } from "../types/global";

export const createTranslations = (translations: Translations) => {
  const translationsWithLanguageId = Object.keys(translations).map(
    (languageCode) => ({
      language: {
        connect: {
          code: languageCode,
        },
      },
      ...translations[languageCode],
    })
  );

  return translationsWithLanguageId;
};
