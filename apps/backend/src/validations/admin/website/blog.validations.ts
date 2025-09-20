import {
  bodySlugValidation,
  generateMetaValidations,
  relationArrayValidation,
  slugValidation,
  validateTranslations,
} from "@/validations/shared";
import { body } from "express-validator";

export const fetchBlogValidation = [slugValidation()];

export const deleteBlogValidation = [slugValidation()];

export const createBlogValidation = [
  bodySlugValidation(),
  body("showInLanding").isBoolean().withMessage("invalidShowInLanding"),
  body("landingOrder").optional().isInt().withMessage("invalidOrder"),
  body("background")
    .optional({ nullable: true })
    .isObject()
    .withMessage("invalidBackground"),
  body("translations")
    .isObject()
    .custom((translations) =>
      validateTranslations(translations, [
        { name: "content", required: true },
        { name: "title", required: true },
      ])
    ),
  relationArrayValidation("categories", "category", { min: 1 }),
  ...generateMetaValidations(),
];

export const updateBlogValidation = [slugValidation(), ...createBlogValidation];
