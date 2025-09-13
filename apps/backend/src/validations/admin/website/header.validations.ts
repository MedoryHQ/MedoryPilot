import { body } from "express-validator";

export const fetchHeaderValidation = [
  body("id").isUUID().withMessage("invalidId"),
];

export const deleteHeaderValidation = fetchHeaderValidation;
