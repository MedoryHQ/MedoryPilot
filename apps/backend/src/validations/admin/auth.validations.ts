import { body } from "express-validator";
import {
  emailValidation,
  existanceValidation,
  passwordValidation,
} from "../shared";

export const loginValidation = [
  passwordValidation(),
  body("email").isEmail().withMessage("invalidEmail"),
];

export const forgotAdminPasswordValidation = [
  emailValidation(),
  existanceValidation("email", "admin"),
];
