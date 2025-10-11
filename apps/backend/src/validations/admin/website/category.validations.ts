import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchCategoryValidation = [uuidValidation()];

export const deleteCategoryValidation = [uuidValidation()];

export const createCategoryValidation = [
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [{ name: "name", required: true }])
    ),
];

export const updateCategoryValidation = [
  uuidValidation(),
  ...createCategoryValidation,
];
