import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchExperienceValidation = [uuidValidation()];

export const deleteExperienceValidation = [uuidValidation()];

export const createExperienceValidation = [
  body("icon")
    .optional({ nullable: true })
    .isObject()
    .withMessage("invalidIcon"),
  body("link")
    .optional()
    .isString()
    .isLength({ min: 1 })
    .withMessage("invalidLink"),
  body("location")
    .optional()
    .isString()
    .isLength({ min: 1 })
    .withMessage("invalidLocation"),
  body("fromDate").isISO8601().withMessage("invalidFromDate"),
  body("endDate").optional().isISO8601().withMessage("invalidEndDate"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [
        { name: "name", required: true },
        { name: "position", required: true },
        { name: "description", required: true },
      ])
    ),
];

export const updateExperienceValidation = [
  uuidValidation(),
  ...createExperienceValidation,
];
