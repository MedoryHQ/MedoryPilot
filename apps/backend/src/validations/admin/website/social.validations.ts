import { uuidValidation } from "@/validations/shared";
import { body } from "express-validator";

export const fetchSocialValidation = [uuidValidation()];

export const deleteSocialValidation = [uuidValidation()];

export const createSocialValidation = [
  body("url")
    .isString()
    .isLength({ min: 8, max: 200 })
    .withMessage("invalidUrl"),
  body("name")
    .isString()
    .isLength({ min: 1, max: 30 })
    .withMessage("invalidName"),
  body("icon")
    .optional({ nullable: true })
    .isObject()
    .withMessage("invalidIcon"),
  body("footerId").optional().isUUID().withMessage("invalidFooterId"),
];

export const updateSocialValidation = [
  uuidValidation(),
  ...createSocialValidation,
];
