import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const createAboutValidation = [
  body("image")
    .optional({ nullable: true })
    .isObject()
    .withMessage("invalidImage"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [
        { name: "headline", required: true },
        { name: "description", required: true },
      ])
    ),
];

export const updateAboutValidation = [
  uuidValidation(),
  ...createAboutValidation,
];
