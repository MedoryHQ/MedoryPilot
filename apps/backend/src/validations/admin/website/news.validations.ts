import {
  generateMetaValidations,
  uuidValidation,
  validateTranslations,
} from "@/validations/shared";
import { body } from "express-validator";

export const fetchNewsValidation = [uuidValidation()];

export const deleteNewsValidation = [uuidValidation()];

export const createNewsValidation = [
  body("showInLanding").isBoolean().withMessage("invalidShowInLanding"),
  body("slug").isString().withMessage("invalidSlug"),
  body("order").optional().isInt().withMessage("invalidOrder"),
  body("background")
    .isObject()
    .optional({ nullable: true })
    .withMessage("invalidBackground"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [{ name: "content", required: true }])
    ),
  ...generateMetaValidations(),
];

export const updateNewsValidation = [...createNewsValidation, uuidValidation()];
