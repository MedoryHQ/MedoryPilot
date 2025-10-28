import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchExperienceValidation = [uuidValidation()];

export const deleteExperienceValidation = [uuidValidation()];

export const createExperienceValidation = [
  body("thumbnail")
    .optional({ nullable: true })
    .isObject()
    .withMessage("invalidThumbnail"),
  body("link").isString().isLength({ min: 1 }).withMessage("invalidLink"),
  body("date").optional().isISO8601().withMessage("invalidDate"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [{ name: "name", required: true }])
    ),
];

export const updateExperienceValidation = [
  uuidValidation(),
  ...createExperienceValidation,
];
