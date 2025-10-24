import { z } from "zod";
import { TFunction } from "i18next";
import { FileSchema } from "../global.validation";

export const socialSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    icon: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("socials.errors.iconRequired", lang)
      }
    ),
    name: z
      .string()
      .min(1, { message: t("socials.errors.nameRequired", lang) }),
    url: z
      .string()
      .min(1, { message: t("socials.errors.urlRequired", lang) })
      .url({ message: t("socials.errors.urlInvalid", lang) })
  });

export type SocialFormValues = z.infer<ReturnType<typeof socialSchema>>;
