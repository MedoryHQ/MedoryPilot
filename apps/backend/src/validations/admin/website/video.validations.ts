import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchVideoValidation = [uuidValidation()];

export const deleteVideoValidation = [uuidValidation()];

export const createVideoValidation = [
  body("thumbnail")
    .optional({ nullable: true })
    .isObject()
    .withMessage("invalidThumbnail"),
  body("link")
    .optional()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("invalidLink"),

  body("date").optional().isISO8601().withMessage("invalidDate"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [{ name: "name", required: true }])
    ),
];

export const updateVideoValidation = [
  uuidValidation(),
  ...createVideoValidation,
];
