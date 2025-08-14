import { body } from "express-validator";
import { getResponseMessage, uniqueFieldValidation } from "../../utils";

export const userRegisterValidation = [
  body("phoneNumber")
    .isString()
    .matches(/^\+9955\d{8}$/)
    .withMessage(getResponseMessage("invalidPhoneNumber")),
  uniqueFieldValidation("phoneNumber", "user"),
  body("email")
    .optional()
    .isEmail()
    .withMessage(getResponseMessage("invalidEmail")),
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

  body("password")
    .isString()
    .withMessage(getResponseMessage("invalidPassword"))
    .isLength({ min: 8, max: 100 })
    .withMessage(getResponseMessage("passwordLength")),

  body("confirmPassword")
    .isString()
    .withMessage(getResponseMessage("invalidConfirmPassword"))
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        return Promise.reject(getResponseMessage("passwordsNotMatch"));
      }
      return true;
    }),
];

export const userVerifyValidation = [
  body("id").isString().withMessage(getResponseMessage("invalidId")),
  body("phone")
    .isString()
    .matches(/^\+9955\d{8}$/)
    .withMessage(getResponseMessage("invalidPhoneNumber")),

  body("code").isString().withMessage(getResponseMessage("invalidCode")),
];

export const userLoginValidation = [
  body("phoneNumber")
    .isString()
    .matches(/^\+9955\d{8}$/)
    .withMessage(getResponseMessage("invalidPhoneNumber")),
  body("password")
    .isString()
    .withMessage(getResponseMessage("invalidPassword"))
    .isLength({ min: 8, max: 100 })
    .withMessage(getResponseMessage("passwordLength")),
];

export const resendUserVerificationCodeValidation = [
  body("phoneNumber")
    .isString()
    .matches(/^\+9955\d{8}$/)
    .withMessage(getResponseMessage("invalidPhoneNumber")),
];
