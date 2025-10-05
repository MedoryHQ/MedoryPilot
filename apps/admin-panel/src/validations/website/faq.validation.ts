import { z } from "zod";

export const faqSchema = (
  t: (key: string, lang?: "en" | "ka") => string,
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
