import { z } from "zod";
import { TFunction } from "i18next";
import { metaSchema } from "../global.validation";

export const pageComponentSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    slug: z
      .string()
      .min(1, { message: t("pageComponents.errors.slugRequired", lang) }),
    footerOrder: z
      .number()
      .nullable()
      .refine((val) => val !== null, {
        message: t("pageComponents.errors.footerOrderRequired", lang)
      }),
    ...metaSchema,
    translations: z.object({
      en: z.object({
        name: z
          .string()
          .min(1, { message: t("pageComponents.errors.nameRequired", "en") }),
        content: z
          .string()
          .min(1, { message: t("pageComponents.errors.contentRequired", "en") })
      }),
      ka: z.object({
        name: z
          .string()
          .min(1, { message: t("pageComponents.errors.nameRequired", "ka") }),
        content: z
          .string()
          .min(1, { message: t("pageComponents.errors.contentRequired", "ka") })
      })
    })
  });

export type PageComponentFormValues = z.infer<
  ReturnType<typeof pageComponentSchema>
>;
