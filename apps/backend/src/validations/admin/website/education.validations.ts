import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchEducationValidation = [uuidValidation()];

export const deleteEducationValidation = [uuidValidation()];

export const createEducationValidation = [
  body("icon")
    .optional({ nullable: true })
    .isObject()
    .withMessage("invalidIcon"),
  body("link")
    .optional()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("invalidLink"),
  body("fromDate").isISO8601().withMessage("invalidFromDate"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("invalidEndDate")
    .bail()
    .custom(
      (v, { req }) =>
        !req.body.fromDate || new Date(v) >= new Date(req.body.fromDate)
    )
    .withMessage("invalidEndDate"),

  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [
        { name: "name", required: true },
        { name: "degree", required: true },
        { name: "description", required: true },
      ])
    ),
];

export const updateEducationValidation = [
  uuidValidation(),
  ...createEducationValidation,
];
