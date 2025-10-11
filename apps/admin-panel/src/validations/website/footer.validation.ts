import { z } from "zod";
import { TFunction } from "i18next";

export const footerSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    phone: z
      .string()
      .min(1, { message: t("footer.errors.phoneRequired", lang) })
      .optional(),
    email: z
      .string()
      .min(1, { message: t("footer.errors.emailRequired", lang) })
      .email({ message: t("footer.errors.emailInvalid", lang) })
      .optional(),
    socials: z
      .array(z.string())
      .min(1, { message: t("footer.errors.socialsRequired", lang) }),
    pages: z
      .array(z.string())
      .min(1, { message: t("footer.errors.pagesRequired", lang) })
  });

export type FooterFormValues = z.infer<ReturnType<typeof footerSchema>>;
