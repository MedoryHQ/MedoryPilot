import { z } from "zod";

export const blogSchema = (
  t: (key: string, lang?: "en" | "ka") => string,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    categories: z
      .array(z.string())
      .min(1, { message: t("blog.errors.categoriesRequired", lang) }),
    background: z
      .instanceof(File)
      .nullable()
      .refine((file) => file !== null, {
        message: t("blog.errors.backgroundRequired", lang)
      }),
    slug: z.string().min(1, { message: t("blog.errors.slugRequired", lang) }),
    showInLanding: z.boolean(),
    landingOrder: z
      .number()
      .nullable()
      .refine((val) => val !== null, {
        message: t("blog.errors.landingOrderRequired", lang)
      }),
    metaTitle: z.string().nullable(),
    metaDescription: z.string().nullable(),
    metaKeywords: z.string().nullable(),
    metaImage: z.string().nullable(),
    translations: z.object({
      en: z.object({
        title: z
          .string()
          .min(1, { message: t("blog.errors.titleRequired", "en") }),
        content: z
          .string()
          .min(1, { message: t("blog.errors.contentRequired", "en") })
      }),
      ka: z.object({
        title: z
          .string()
          .min(1, { message: t("blog.errors.titleRequired", "ka") }),
        content: z
          .string()
          .min(1, { message: t("blog.errors.contentRequired", "ka") })
      })
    })
  });

export type BlogFormValues = z.infer<ReturnType<typeof blogSchema>>;
