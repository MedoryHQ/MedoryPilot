import { z } from "zod";
import { TFunction } from "i18next";
import { FileSchema, metaSchema } from "../global.validation";

export const blogSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    categories: z
      .array(z.string())
      .min(1, { message: t("blogs.errors.categoriesRequired", lang) }),
    background: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("blogs.errors.backgroundRequired", lang)
      }
    ),
    slug: z.string().min(1, { message: t("blogs.errors.slugRequired", lang) }),
    showInLanding: z.boolean(),
    landingOrder: z
      .number()
      .nullable()
      .refine((val) => val !== null, {
        message: t("blogs.errors.landingOrderRequired", lang)
      }),
    ...metaSchema,
    translations: z.object({
      en: z.object({
        title: z
          .string()
          .min(1, { message: t("blogs.errors.titleRequired", "en") }),
        content: z
          .string()
          .min(1, { message: t("blogs.errors.contentRequired", "en") })
      }),
      ka: z.object({
        title: z
          .string()
          .min(1, { message: t("blogs.errors.titleRequired", "ka") }),
        content: z
          .string()
          .min(1, { message: t("blogs.errors.contentRequired", "ka") })
      })
    })
  });

export type BlogFormValues = z.infer<ReturnType<typeof blogSchema>>;
