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
    fromDate: z.preprocess((val) => {
      if (val === "" || val === null || val === undefined) return null;
      if (typeof val === "string") return new Date(val);
      return val;
    }, z.date().nullable()),
    endDate: z.preprocess((val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      if (typeof val === "string") return new Date(val);
      return val;
    }, z.date().optional()),
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

export const educationSubmitSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  educationSchema(t, lang).superRefine((data, ctx) => {
    if (data.fromDate === null || data.fromDate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("educations.errors.fromDateRequired", lang),
        path: ["fromDate"]
      });
    }
    if (
      data.fromDate instanceof Date &&
      data.endDate instanceof Date &&
      data.endDate < data.fromDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("educations.errors.endDateBeforeFromDate", lang),
        path: ["endDate"]
      });
    }
  });

export type EducationFormValues = z.infer<ReturnType<typeof educationSchema>>;
export type EducationSubmitValues = z.infer<
  ReturnType<typeof educationSubmitSchema>
>;
