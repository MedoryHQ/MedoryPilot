import { prisma } from "@/config";
import { isUuid } from "@/utils";
import {
  bodySlugValidation,
  generateMetaValidations,
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

  body("categories")
    .isArray({ min: 1 })
    .withMessage("categoriesLength")
    .custom(async (categories: string[]) => {
      const invalid = categories.filter((c) => !isUuid(c));
      if (invalid.length > 0) {
        throw new Error(
          JSON.stringify({
            en: `Invalid category IDs: ${invalid.join(", ")}`,
            ka: `არასწორი კატეგორიის ID: ${invalid.join(", ")}`,
          })
        );
      }

      const categoriesCount = await prisma.category.count({
        where: { id: { in: categories } },
      });

      if (categoriesCount !== categories.length) {
        throw new Error(
          JSON.stringify({
            en: "Some categories do not exist",
            ka: "ზოგიერთი კატეგორია არ არსებობს",
          })
        );
      }

      return true;
    }),

  ...generateMetaValidations(),
];

export const updateBlogValidation = [slugValidation(), ...createBlogValidation];
