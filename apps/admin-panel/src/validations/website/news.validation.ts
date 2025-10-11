import { z } from "zod";
import { TFunction } from "i18next";

export const newsSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    background: z
      .instanceof(File)
      .nullable()
      .refine((file) => file !== null, {
        message: t("news.errors.backgroundRequired", lang)
      }),
    slug: z.string().min(1, { message: t("news.errors.slugRequired", lang) }),
    showInLanding: z.boolean(),
    order: z
      .number()
      .nullable()
      .refine((val) => val !== null, {
        message: t("news.errors.orderRequired", lang)
      }),
    metaTitle: z.string().nullable(),
    metaDescription: z.string().nullable(),
    metaKeywords: z.string().nullable(),
    metaImage: z.string().nullable(),
    translations: z.object({
      en: z.object({
        content: z
          .string()
          .min(1, { message: t("news.errors.contentRequired", "en") })
      }),
      ka: z.object({
        content: z
          .string()
          .min(1, { message: t("news.errors.contentRequired", "ka") })
      })
    })
  });

export type NewsFormValues = z.infer<ReturnType<typeof newsSchema>>;
