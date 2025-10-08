import { z } from "zod";

const BackendFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number()
});

export const serviceSchema = (
  t: (key: string, lang?: "en" | "ka") => string,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    icon: BackendFileSchema.nullable().refine((file) => file !== null, {
      message: t("headers.errors.iconRequired", lang)
    }),
    background: BackendFileSchema.nullable().refine((file) => file !== null, {
      message: t("headers.errors.backgroundRequired", lang)
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
