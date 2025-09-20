import { relationArrayValidation, uuidValidation } from "@/validations/shared";
import { body } from "express-validator";

export const fetchFooterValidation = [uuidValidation()];

export const deleteFooterValidation = [uuidValidation()];

export const createFooterValidation = [
  body("phone").optional().isString().withMessage("invalidPhone"),
  body("email").optional().isString().withMessage("invalidEmail"),
  relationArrayValidation("socials", "social", { min: 1 }),
  relationArrayValidation("pages", "pageComponent", { min: 1 }),
];

export const updateFooterValidation = [
  uuidValidation(),
  ...createFooterValidation,
];
