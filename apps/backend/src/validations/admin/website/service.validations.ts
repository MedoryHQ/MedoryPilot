import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchServiceValidation = [uuidValidation()];

export const deleteServiceValidation = [uuidValidation()];

export const createServiceValidation = [
  body("icon")
    .isObject()
    .optional({ nullable: true })
    .withMessage("invalidIcon"),
  body("background")
    .isObject()
    .optional({ nullable: true })
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
