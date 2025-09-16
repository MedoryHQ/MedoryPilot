import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const createContactValidation = [
  body("location").optional().isString().withMessage("invalidLocation"),
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

export const updateContactValidation = [
  ...createContactValidation,
  uuidValidation(),
];
