import { z } from "zod";
import { TFunction } from "i18next";

const BackendFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number()
});

export const contactSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    location: z.string().optional(),
    background: BackendFileSchema.nullable().refine((file) => file !== null, {
      message: t("headers.errors.backgroundRequired", lang)
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
