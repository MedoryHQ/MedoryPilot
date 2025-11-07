import { z } from "zod";
import { TFunction } from "i18next";
import { FileSchema } from "../global.validation";

export const headerSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    logo: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("headers.errors.logoRequired", lang)
      }
    ),
    active: z
      .boolean()
      .nullable()
      .refine((val) => val !== null, {
        message: t("headers.errors.activeRequired", lang)
      }),
    experience: z
      .number()
      .min(1, {
        message: t("headers.errors.invalidExperience", lang)
      })
      .optional(),
    visits: z
      .number()
      .min(1, {
        message: t("headers.errors.invalidVisits", lang)
      })
      .optional(),
    translations: z.object({
      en: z.object({
        name: z
          .string()
          .min(1, { message: t("headers.errors.nameRequired", "en") }),
        position: z
          .string()
          .min(1, { message: t("headers.errors.positionRequired", "en") }),
        headline: z
          .string()
          .min(1, { message: t("headers.errors.headlineRequired", "en") }),
        description: z
          .string()
          .min(1, { message: t("headers.errors.descriptionRequired", "en") })
      }),
      ka: z.object({
        name: z
          .string()
          .min(1, { message: t("headers.errors.nameRequired", "ka") }),
        position: z
          .string()
          .min(1, { message: t("headers.errors.positionRequired", "ka") }),
        headline: z
          .string()
          .min(1, { message: t("headers.errors.headlineRequired", "ka") }),
        description: z
          .string()
          .min(1, { message: t("headers.errors.descriptionRequired", "ka") })
      })
    })
  });

export type HeaderFormValues = z.infer<ReturnType<typeof headerSchema>>;
