import { uuidValidation } from "@/validations/shared";
import { body } from "express-validator";

export const fetchSocialValidation = [uuidValidation()];

export const deleteSocialValidation = [uuidValidation()];

export const createSocialValidation = [
  body("url").isString().withMessage("invalidUrl"),
  body("name").isString().withMessage("invalidName"),
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
