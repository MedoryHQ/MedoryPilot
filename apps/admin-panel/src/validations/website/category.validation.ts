import { z } from "zod";

export const categorySchema = (
  t: (key: string, lang?: "en" | "ka") => string
) =>
  z.object({
    translations: z.object({
      en: z.object({
        name: z
          .string()
          .min(1, { message: t("categories.errors.nameRequired", "en") })
      }),
      ka: z.object({
        name: z
          .string()
          .min(1, { message: t("categories.errors.nameRequired", "ka") })
      })
    })
  });

export type CategoryFormValues = z.infer<ReturnType<typeof categorySchema>>;
