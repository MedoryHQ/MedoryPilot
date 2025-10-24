import { z } from "zod";
import { TFunction } from "i18next";
import { FileSchema, metaSchema } from "../global.validation";

export const newsSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    background: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("newses.errors.backgroundRequired", lang)
      }
    ),
    slug: z.string().min(1, { message: t("newses.errors.slugRequired", lang) }),
    showInLanding: z.boolean(),
    order: z
      .number()
      .nullable()
      .refine((val) => val !== null, {
        message: t("newses.errors.orderRequired", lang)
      }),
    ...metaSchema,
    translations: z.object({
      en: z.object({
        content: z
          .string()
          .min(1, { message: t("newses.errors.contentRequired", "en") })
      }),
      ka: z.object({
        content: z
          .string()
          .min(1, { message: t("newses.errors.contentRequired", "ka") })
      })
    })
  });

export type NewsFormValues = z.infer<ReturnType<typeof newsSchema>>;
