import { validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchHeaderValidation = [
  body("id").isUUID().withMessage("invalidId"),
];

export const deleteHeaderValidation = fetchHeaderValidation;

export const createHeaderValidation = [
  body("active").optional().isBoolean().withMessage("invalidActiveType"),
  body("logo")
    .isObject()
    .optional({ nullable: true })
    .withMessage("invalidLogo"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [
        { name: "name", required: true },
        { name: "position", required: true },
        { name: "headline", required: true },
        { name: "description", required: true },
      ])
    ),
];
