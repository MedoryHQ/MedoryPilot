import { z } from "zod";

export const headerSchema = (
  t: (key: string, lang?: "en" | "ka") => string,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    logo: z
      .instanceof(File)
      .nullable()
      .refine((file) => file !== null, {
        message: t("header.errors.logoRequired", lang)
      }),
    active: z
      .boolean()
      .nullable()
      .refine((val) => val !== null, {
        message: t("header.errors.activeRequired", lang)
      }),
    translations: z.object({
      en: z.object({
        name: z
          .string()
          .min(1, { message: t("header.errors.nameRequired", "en") }),
        position: z
          .string()
          .min(1, { message: t("header.errors.positionRequired", "en") }),
        headline: z
          .string()
          .min(1, { message: t("header.errors.headlineRequired", "en") }),
        description: z
          .string()
          .min(1, { message: t("header.errors.descriptionRequired", "en") })
      }),
      ka: z.object({
        name: z
          .string()
          .min(1, { message: t("header.errors.nameRequired", "ka") }),
        position: z
          .string()
          .min(1, { message: t("header.errors.positionRequired", "ka") }),
        headline: z
          .string()
          .min(1, { message: t("header.errors.headlineRequired", "ka") }),
        description: z
          .string()
          .min(1, { message: t("header.errors.descriptionRequired", "ka") })
      })
    })
  });

export type HeaderFormValues = z.infer<ReturnType<typeof headerSchema>>;
