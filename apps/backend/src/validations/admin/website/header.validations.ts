import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchHeaderValidation = [uuidValidation()];

export const deleteHeaderValidation = [uuidValidation()];

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

export const updateHeaderValidation = [
  uuidValidation(),
  ...createHeaderValidation,
];
