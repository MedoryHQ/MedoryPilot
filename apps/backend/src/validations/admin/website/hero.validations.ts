import { uuidValidation, validateTranslations } from "@/validations/shared";
import { body } from "express-validator";

export const fetchHeroValidation = [uuidValidation()];

export const deleteHeroValidation = [uuidValidation()];

export const createHeroValidation = [
  body("active").optional().isBoolean().withMessage("invalidActiveType"),
  body("experience").optional().isInt().withMessage("invalidExperience"),
  body("visits").optional().isInt().withMessage("invalidVisits"),
  body("logo")
    .isObject()
    .optional({ nullable: true })
    .withMessage("invalidLogo"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [
        { name: "name", required: true },
        { name: "position", required: true },
        { name: "headline", required: true },
        { name: "description", required: true },
      ])
    ),
];

export const updateHeroValidation = [uuidValidation(), ...createHeroValidation];
