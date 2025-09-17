import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchServiceValidation = [uuidValidation()];

export const deleteServiceValidation = [uuidValidation()];

export const createServiceValidation = [
  body("icon")
    .optional({ nullable: true })
    .isObject()
    .withMessage("invalidIcon"),
  body("background")
    .optional({ nullable: true })
    .isObject()
    .withMessage("invalidBackground"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [
        { name: "title", required: true },
        { name: "description", required: true },
      ])
    ),
];

export const updateServiceValidation = [
  ...createServiceValidation,
  uuidValidation(),
];
