import {
  bodySlugValidation,
  generateMetaValidations,
  slugValidation,
  validateTranslations,
} from "@/validations/shared";
import { body } from "express-validator";

export const fetchPageComponentValidation = [slugValidation()];

export const deletePageComponentValidation = [slugValidation()];

export const createPageComponentValidation = [
  bodySlugValidation(),
  body("footerId").optional().isUUID().withMessage("invalidFooterId"),
  body("footerOrder").optional().isInt().withMessage("invalidOrder"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [
        { name: "name", required: true },
        { name: "content", required: true },
      ])
    ),
  ...generateMetaValidations(),
];

export const updatePageComponentValidation = [
  slugValidation(),
  ...createPageComponentValidation,
];
