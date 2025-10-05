import { z } from "zod";

export const serviceSchema = (
  t: (key: string, lang?: "en" | "ka") => string,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    icon: z
      .instanceof(File)
      .nullable()
      .refine((file) => file !== null, {
        message: t("service.errors.iconRequired", lang)
      }),
    background: z
      .instanceof(File)
      .nullable()
      .refine((file) => file !== null, {
        message: t("service.errors.backgroundRequired", lang)
      }),
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
