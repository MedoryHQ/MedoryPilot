import { z } from "zod";
import { TFunction } from "i18next";
import { FileSchema } from "../global.validation";

export const serviceSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    icon: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("headers.errors.iconRequired", lang)
      }
    ),
    background: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("headers.errors.backgroundRequired", lang)
      }
    ),
    translations: z.object({
      en: z.object({
        title: z
          .string()
          .min(1, { message: t("service.errors.titleRequired", "en") }),
        description: z
          .string()
          .min(1, { message: t("service.errors.descriptionRequired", "en") })
      }),
      ka: z.object({
        title: z
          .string()
          .min(1, { message: t("service.errors.titleRequired", "ka") }),
        description: z
          .string()
          .min(1, { message: t("service.errors.descriptionRequired", "ka") })
      })
    })
  });

export type ServiceFormValues = z.infer<ReturnType<typeof serviceSchema>>;
