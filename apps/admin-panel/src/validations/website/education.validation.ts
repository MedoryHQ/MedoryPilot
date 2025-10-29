import { z } from "zod";
import { TFunction } from "i18next";
import { FileSchema } from "../global.validation";

export const educationSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    icon: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("educations.errors.iconRequired", lang)
      }
    ),
    link: z.string().optional(),
    fromDate: z
      .date()
      .min(1, { message: t("educations.errors.fromDateRequired", lang) }),
    endDate: z.date().optional(),
    translations: z.object({
      en: z.object({
        name: z
          .string()
          .min(1, { message: t("educations.errors.nameRequired", "en") }),
        degree: z
          .string()
          .min(1, { message: t("educations.errors.degreeRequired", "en") }),
        description: z.string().min(1, {
          message: t("educations.errors.descriptionRequired", "en")
        })
      }),
      ka: z.object({
        name: z
          .string()
          .min(1, { message: t("educations.errors.nameRequired", "ka") }),
        degree: z
          .string()
          .min(1, { message: t("educations.errors.degreeRequired", "ka") }),
        description: z.string().min(1, {
          message: t("educations.errors.descriptionRequired", "ka")
        })
      })
    })
  });

export type EducationFormValues = z.infer<ReturnType<typeof educationSchema>>;
