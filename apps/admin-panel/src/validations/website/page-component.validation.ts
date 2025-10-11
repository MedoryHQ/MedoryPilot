import { z } from "zod";
import { TFunction } from "i18next";

export const pageComponentSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    slug: z
      .string()
      .min(1, { message: t("pageComponent.errors.slugRequired", lang) }),
    footerOrder: z
      .number()
      .nullable()
      .refine((val) => val !== null, {
        message: t("pageComponent.errors.footerOrderRequired", lang)
      }),
    metaTitle: z.string().nullable(),
    metaDescription: z.string().nullable(),
    metaKeywords: z.string().nullable(),
    metaImage: z.string().nullable(),
    translations: z.object({
      en: z.object({
        name: z
          .string()
          .min(1, { message: t("pageComponent.errors.nameRequired", "en") }),
        content: z
          .string()
          .min(1, { message: t("pageComponent.errors.contentRequired", "en") })
      }),
      ka: z.object({
        name: z
          .string()
          .min(1, { message: t("pageComponent.errors.nameRequired", "ka") }),
        content: z
          .string()
          .min(1, { message: t("pageComponent.errors.contentRequired", "ka") })
      })
    })
  });

export type PageComponentFormValues = z.infer<
  ReturnType<typeof pageComponentSchema>
>;
