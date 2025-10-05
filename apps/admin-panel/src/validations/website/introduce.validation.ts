import { z } from "zod";

export const introduceSchema = (
  t: (key: string, lang?: "en" | "ka") => string
) =>
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
