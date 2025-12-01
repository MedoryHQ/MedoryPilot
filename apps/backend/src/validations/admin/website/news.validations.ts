import {
  bodySlugValidation,
  generateMetaValidations,
  slugValidation,
  validateTranslations,
} from "@/validations/shared";
import { body } from "express-validator";

export const fetchNewsValidation = [slugValidation()];

export const deleteNewsValidation = [slugValidation()];

export const createNewsValidation = [
  bodySlugValidation(),
  body("showInLanding").isBoolean().withMessage("invalidShowInLanding"),
  body("order").optional().isInt().withMessage("invalidOrder"),
  body("background")
    .optional({ nullable: true })
    .isObject()
    .withMessage("invalidBackground"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [
        { name: "name", required: true },
        { name: "content", required: true },
        { name: "description", required: false },
      ])
    ),
  ...generateMetaValidations(),
];

export const updateNewsValidation = [slugValidation(), ...createNewsValidation];
