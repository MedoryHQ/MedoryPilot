import { z } from "zod";
import { TFunction } from "i18next";
import { FileSchema } from "../global.validation";

export const videoSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    thumbnail: FileSchema.nullable().refine(
      (file) => file === null || typeof file === "object",
      {
        message: t("videos.errors.thumbnailRequired", lang)
      }
    ),
    link: z.string().min(1, { message: t("videos.errors.linkRequired", lang) }),
    date: z.date().optional(),
    translations: z.object({
      en: z.object({
        name: z
          .string()
          .min(1, { message: t("videos.errors.nameRequired", "en") })
      }),
      ka: z.object({
        name: z
          .string()
          .min(1, { message: t("videos.errors.nameRequired", "ka") })
      })
    })
  });

export type VideoFormValues = z.infer<ReturnType<typeof videoSchema>>;
