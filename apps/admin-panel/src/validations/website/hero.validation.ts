import { z } from "zod";
import { TFunction } from "i18next";
import { FileSchema } from "../global.validation";

export const heroSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    logo: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("heros.errors.logoRequired", lang)
      }
    ),
    active: z
      .boolean()
      .nullable()
      .refine((val) => val !== null, {
        message: t("heros.errors.activeRequired", lang)
      }),
    experience: z
      .number()
      .min(1, {
        message: t("heros.errors.invalidExperience", lang)
      })
      .optional(),
    visits: z
      .number()
      .min(1, {
        message: t("heros.errors.invalidVisits", lang)
      })
      .optional(),
    translations: z.object({
      en: z.object({
        name: z
          .string()
          .min(1, { message: t("heros.errors.nameRequired", "en") }),
        position: z
          .string()
          .min(1, { message: t("heros.errors.positionRequired", "en") }),
        headline: z
          .string()
          .min(1, { message: t("heros.errors.headlineRequired", "en") }),
        description: z
          .string()
          .min(1, { message: t("heros.errors.descriptionRequired", "en") })
      }),
      ka: z.object({
        name: z
          .string()
          .min(1, { message: t("heros.errors.nameRequired", "ka") }),
        position: z
          .string()
          .min(1, { message: t("heros.errors.positionRequired", "ka") }),
        headline: z
          .string()
          .min(1, { message: t("heros.errors.headlineRequired", "ka") }),
        description: z
          .string()
          .min(1, { message: t("heros.errors.descriptionRequired", "ka") })
      })
    })
  });

export type HeroFormValues = z.infer<ReturnType<typeof heroSchema>>;
