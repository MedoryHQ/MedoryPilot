import { z } from "zod";
import { TFunction } from "i18next";
import { FileSchema } from "../global.validation";

export const aboutSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    image: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("about.errors.imageRequired", lang)
      }
    ),
    translations: z.object({
      en: z.object({
        headline: z
          .string()
          .min(1, { message: t("about.errors.headlineRequired", "en") }),
        description: z
          .string()
          .min(1, { message: t("about.errors.descriptionRequired", "en") })
      }),
      ka: z.object({
        headline: z
          .string()
          .min(1, { message: t("about.errors.headlineRequired", "ka") }),
        description: z
          .string()
          .min(1, { message: t("about.errors.descriptionRequired", "ka") })
      })
    })
  });

export type AboutFormValues = z.infer<ReturnType<typeof aboutSchema>>;
