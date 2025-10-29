import { z } from "zod";
import { TFunction } from "i18next";
import { FileSchema } from "../global.validation";

export const experienceSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    icon: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("experiences.errors.iconRequired", lang)
      }
    ),
    location: z.string().optional(),
    link: z.string().optional(),
    fromDate: z
      .date()
      .min(1, { message: t("experiences.errors.fromDateRequired", lang) }),
    endDate: z.date().optional(),
    translations: z.object({
      en: z.object({
        name: z
          .string()
          .min(1, { message: t("experiences.errors.nameRequired", "en") }),
        position: z
          .string()
          .min(1, { message: t("experiences.errors.positionRequired", "en") }),
        description: z.string().min(1, {
          message: t("experiences.errors.descriptionRequired", "en")
        })
      }),
      ka: z.object({
        name: z
          .string()
          .min(1, { message: t("experiences.errors.nameRequired", "ka") }),
        position: z
          .string()
          .min(1, { message: t("experiences.errors.positionRequired", "ka") }),
        description: z.string().min(1, {
          message: t("experiences.errors.descriptionRequired", "ka")
        })
      })
    })
  });

export type ExperienceFormValues = z.infer<ReturnType<typeof experienceSchema>>;
