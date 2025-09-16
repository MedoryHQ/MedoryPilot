import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchIntroduceValidation = [uuidValidation()];

export const deleteIntroduceValidation = [uuidValidation()];

export const createIntroduceValidation = [
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [
        { name: "headline", required: true },
        { name: "description", required: true },
      ])
    ),
];

export const updateIntroduceValidation = [
  ...createIntroduceValidation,
  uuidValidation(),
];
