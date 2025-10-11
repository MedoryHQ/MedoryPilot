import { z } from "zod";
import { TFunction } from "i18next";

export const tariffSchema = (
  t: TFunction<"translation", undefined>,
  lang: "en" | "ka" = "en"
) =>
  z.object({
    price: z
      .number()
      .min(1, { message: t("tariffs.errors.priceRequired", lang) })
  });

export type TariffFormValues = z.infer<ReturnType<typeof tariffSchema>>;
