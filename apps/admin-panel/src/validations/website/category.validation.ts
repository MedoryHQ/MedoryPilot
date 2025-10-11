import { TFunction } from "i18next";
import { z } from "zod";

export const categorySchema = (t: TFunction<"translation", undefined>) =>
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
