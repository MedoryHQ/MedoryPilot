import { z } from "zod";
import { TFunction } from "i18next";

export const introduceSchema = (t: TFunction<"translation", undefined>) =>
  z.object({
    translations: z.object({
      en: z.object({
        headline: z
          .string()
          .min(1, { message: t("introduce.errors.headlineRequired", "en") }),
        description: z
          .string()
          .min(1, { message: t("introduce.errors.descriptionRequired", "en") })
      }),
      ka: z.object({
        headline: z
          .string()
          .min(1, { message: t("introduce.errors.headlineRequired", "ka") }),
        description: z
          .string()
          .min(1, { message: t("introduce.errors.descriptionRequired", "ka") })
      })
    })
  });

export type IntroduceFormValues = z.infer<ReturnType<typeof introduceSchema>>;
