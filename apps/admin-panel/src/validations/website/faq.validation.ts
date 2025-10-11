import { z } from "zod";
import { TFunction } from "i18next";

export const faqSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    order: z.number().min(1, { message: t("faq.errors.orderRequired", lang) }),
    translations: z.object({
      en: z.object({
        question: z
          .string()
          .min(1, { message: t("faq.errors.questionRequired", "en") }),
        answer: z
          .string()
          .min(1, { message: t("faq.errors.answerRequired", "en") })
      }),
      ka: z.object({
        question: z
          .string()
          .min(1, { message: t("faq.errors.questionRequired", "ka") }),
        answer: z
          .string()
          .min(1, { message: t("faq.errors.answerRequired", "ka") })
      })
    })
  });

export type FaqFormValues = z.infer<ReturnType<typeof faqSchema>>;
