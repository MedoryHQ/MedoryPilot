import { body } from "express-validator";
import { passwordValidation } from "../shared";

export const loginValidation = [
  passwordValidation(),
  body("email").isEmail().withMessage("invalidEmail"),
];
