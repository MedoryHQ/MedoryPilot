import { z } from "zod";

const BackendFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number()
});

export const headerSchema = (
  t: (key: string, lang?: "en" | "ka") => string,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    logo: BackendFileSchema.nullable().refine((file) => file !== null, {
      message: t("headers.errors.logoRequired", lang)
    }),
    active: z
      .boolean()
      .nullable()
      .refine((val) => val !== null, {
        message: t("headers.errors.activeRequired", lang)
      }),
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
