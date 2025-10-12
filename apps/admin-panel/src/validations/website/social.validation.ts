import { z } from "zod";
import { TFunction } from "i18next";

const BackendFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number().optional()
});
export const socialSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    icon: BackendFileSchema.nullable().refine((file) => file !== null, {
      message: t("socials.errors.iconRequired", lang)
    }),
    name: z
      .string()
      .min(1, { message: t("socials.errors.nameRequired", lang) }),
    url: z
      .string()
      .min(1, { message: t("socials.errors.urlRequired", lang) })
      .url({ message: t("socials.errors.urlInvalid", lang) })
  });

export type SocialFormValues = z.infer<ReturnType<typeof socialSchema>>;
