import { z } from "zod";
import { TFunction } from "i18next";

export const socialSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    icon: z
      .instanceof(File)
      .nullable()
      .refine((file) => file !== null, {
        message: t("social.errors.iconRequired", lang)
      }),
    name: z.string().min(1, { message: t("social.errors.nameRequired", lang) }),
    url: z
      .string()
      .min(1, { message: t("social.errors.urlRequired", lang) })
      .url({ message: t("social.errors.urlInvalid", lang) }),
    footerId: z
      .string()
      .min(1, { message: t("social.errors.footerIdRequired", lang) })
  });

export type SocialFormValues = z.infer<ReturnType<typeof socialSchema>>;
