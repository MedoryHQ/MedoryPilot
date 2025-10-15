import { z } from "zod";
import { TFunction } from "i18next";

export const footerSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    phone: z
      .string()
      .nonempty({ message: t("footer.errors.phoneRequired", lang) })
      .regex(/^\+9955\d{8}$/, {
        message: t("footer.errors.phoneInvalid", lang)
      }),
    email: z
      .string()
      .nonempty({ message: t("footer.errors.emailRequired", lang) })
      .email({ message: t("footer.errors.emailInvalid", lang) }),
    socials: z
      .array(z.string())
      .min(1, { message: t("footer.errors.socialsRequired", lang) }),
    pages: z
      .array(z.string())
      .min(1, { message: t("footer.errors.pagesRequired", lang) })
  });

export type FooterFormValues = z.infer<ReturnType<typeof footerSchema>>;
