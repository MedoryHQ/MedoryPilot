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

export const experienceSubmitSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  experienceSchema(t, lang).superRefine((data, ctx) => {
    if (data.fromDate === null || data.fromDate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("experiences.errors.fromDateRequired", lang),
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
        message: t("experiences.errors.endDateBeforeFromDate", lang),
        path: ["endDate"]
      });
    }
  });

export type ExperienceFormValues = z.infer<ReturnType<typeof experienceSchema>>;
export type ExperienceSubmitValues = z.infer<
  ReturnType<typeof experienceSubmitSchema>
>;
