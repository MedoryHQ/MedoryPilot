import { body } from "express-validator";
import {
  codeValidation,
  confirmPasswordValidation,
  emailValidation,
  existanceValidation,
  passwordValidation,
  phoneValidation,
  uniqueFieldValidation,
} from "../shared";

export const userRegisterValidation = [
  phoneValidation(),
  uniqueFieldValidation("phoneNumber", "user"),
  emailValidation("email", true),
  uniqueFieldValidation("email", "user", true),

  body("firstName").trim().isString().withMessage("invalidFirstName"),
  body("lastName").trim().isString().withMessage("invalidLastName"),
  body("dateOfBirth").isString().withMessage("invalidDateOfBirth"),

  body("personalId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("invalidPersonalId")
    .isLength({ min: 9, max: 20 })
    .withMessage("personalIdLength"),

  passwordValidation(),
  confirmPasswordValidation(),
];

export const userVerifyValidation = [
  body("id").isString().withMessage("invalidId"),
  phoneValidation(),
  codeValidation("code"),
];

export const userLoginValidation = [phoneValidation(), passwordValidation()];

export const resendUserVerificationCodeValidation = [phoneValidation()];

export const forgotUserPasswordValidation =
  resendUserVerificationCodeValidation;

export const forgotPasswordVerificationValidation = [
  phoneValidation(),
  codeValidation("smsCode"),
];

export const resetPasswordValidation = [
  body("type")
    .isIn(["phoneNumber", "email"])
    .withMessage("invalidResetPasswordType"),

  codeValidation("smsCode"),

  body("phoneNumber")
    .if(body("type").equals("phoneNumber"))
    .isString()
    .matches(/^\+9955\d{8}$/)
    .withMessage("invalidPhoneNumber"),

  body("email")
    .if(body("type").equals("email"))
    .exists({ checkFalsy: true })
    .withMessage("invalidEmail")
    .bail()
    .isEmail()
    .withMessage("invalidEmail"),

  passwordValidation(),
];

export const forgotUserPasswordWithEmailValidation = [
  emailValidation(),
  existanceValidation("email", "user"),
];
