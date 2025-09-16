import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchFAQValidation = [uuidValidation()];

export const deleteFAQValidation = [uuidValidation()];

export const createFAQValidation = [
  body("order").optional().isInt().withMessage("invalidOrder"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [
        { name: "question", required: true },
        { name: "answer", required: true },
      ])
    ),
];

export const updateFAQValidation = [...createFAQValidation, uuidValidation()];
