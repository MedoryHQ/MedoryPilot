import { body } from "express-validator";
import {
  codeValidation,
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

export const forgotAdminPasswordVerificationValidation = [
  emailValidation(),
  codeValidation("smsCode"),
];

export const resetAdminPasswordValidation = [
  codeValidation("smsCode"),
  emailValidation(),
  passwordValidation(),
];
