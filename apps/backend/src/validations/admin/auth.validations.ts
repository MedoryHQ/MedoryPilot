import { body } from "express-validator";
import { getResponseMessage } from "utils";

export const loginValidation = [
  body("email").isEmail().withMessage(getResponseMessage("invalidEmail")),
  body("password")
    .isString()
    .withMessage(getResponseMessage("invalidPassword")),
];
