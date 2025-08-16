import { body } from "express-validator";
import { getResponseMessage, passwordValidation } from "utils";

export const loginValidation = [
  body("email").isEmail().withMessage(getResponseMessage("invalidEmail")),
  passwordValidation(),
];
