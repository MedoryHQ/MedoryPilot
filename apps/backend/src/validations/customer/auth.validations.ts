import { body } from "express-validator";
import {
  codeValidation,
  confirmPasswordValidation,
  emailValidation,
  existanceValidation,
  getResponseMessage,
  passwordValidation,
  phoneValidation,
  uniqueFieldValidation,
} from "../../utils";

export const userRegisterValidation = [
  phoneValidation(),
  uniqueFieldValidation("phoneNumber", "user"),
  emailValidation("email", true),
  uniqueFieldValidation("email", "user", true),

  body("firstName")
    .trim()
    .isString()
    .withMessage(getResponseMessage("invalidFirstName")),
  body("lastName")
    .trim()
    .isString()
    .withMessage(getResponseMessage("invalidLastName")),
  body("dateOfBirth")
    .isString()
    .withMessage(getResponseMessage("invalidDateOfBirth")),

  body("personalId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage(getResponseMessage("invalidPersonalId"))
    .isLength({ min: 9, max: 20 })
    .withMessage(getResponseMessage("personalIdLength")),

  passwordValidation(),
  confirmPasswordValidation(),
];

export const userVerifyValidation = [
  body("id").isString().withMessage(getResponseMessage("invalidId")),
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
    .withMessage(getResponseMessage("invalidResetPasswordType")),

  codeValidation("smsCode"),

  phoneValidation().if(body("type").equals("phoneNumber")),
  existanceValidation("phoneNumber", "user"),

  emailValidation("email", false).if(body("type").equals("email")),
  existanceValidation("email", "user"),

  passwordValidation(),
];

export const forgotUserPasswordWithEmailValidation = [
  emailValidation(),
  existanceValidation("email", "user"),
];
