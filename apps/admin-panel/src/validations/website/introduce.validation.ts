import { z } from "zod";
import { TFunction } from "i18next";
import { FileSchema } from "../global.validation";

export const introduceSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    translations: z.object({
      en: z.object({
        headline: z
          .string()
          .min(1, { message: t("introduce.errors.headlineRequired", "en") }),
        description: z
          .string()
          .min(1, { message: t("introduce.errors.descriptionRequired", "en") })
      }),
      ka: z.object({
        headline: z
          .string()
          .min(1, { message: t("introduce.errors.headlineRequired", "ka") }),
        description: z
          .string()
          .min(1, { message: t("introduce.errors.descriptionRequired", "ka") })
      })
    }),
    thumbnail: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("introduce.errors.thumbnailRequired", lang)
      }
    ),
    video: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("introduce.errors.videoRequired", lang)
      }
    )
  });

export type IntroduceFormValues = z.infer<ReturnType<typeof introduceSchema>>;
