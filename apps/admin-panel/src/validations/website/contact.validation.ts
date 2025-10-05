import { z } from "zod";

export const contactSchema = (
  t: (key: string, lang?: "en" | "ka") => string,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    location: z.string().optional(),
    background: z
      .instanceof(File)
      .nullable()
      .refine((file) => file !== null, {
        message: t("contact.errors.backgroundRequired", lang)
      }),
    translations: z.object({
      en: z.object({
        title: z
          .string()
          .min(1, { message: t("contact.errors.titleRequired", "en") }),
        description: z
          .string()
          .min(1, { message: t("contact.errors.descriptionRequired", "en") })
      }),
      ka: z.object({
        title: z
          .string()
          .min(1, { message: t("contact.errors.titleRequired", "ka") }),
        description: z
          .string()
          .min(1, { message: t("contact.errors.descriptionRequired", "ka") })
      })
    })
  });

export type ContactFormValues = z.infer<ReturnType<typeof contactSchema>>;
