import { body } from "express-validator";
import { prisma } from "../../config";
import { getErrorMessage } from "../../utils";

export const userRegisterValidation = [
  body("phoneNumber")
    .isString()
    .matches(/^\+9955\d{8}$/)
    .withMessage(getErrorMessage("invalidPhoneNumber"))
    .custom(async (_, { req }) => {
      const { phoneNumber } = req.body;
      const userExists = await prisma.user.count({
        where: { phoneNumber },
      });
      if (userExists) {
        return Promise.reject(getErrorMessage("phoneAlreadyExists"));
      }
    }),

  body("email")
    .optional()
    .isEmail()
    .withMessage(getErrorMessage("invalidEmail"))
    .custom(async (_, { req }) => {
      const { email } = req.body;
      if (!email) return true;
      const userExists = await prisma.user.count({
        where: { email },
      });
      if (userExists) {
        return Promise.reject(getErrorMessage("emailAlreadyExists"));
      }
    }),

  body("firstName")
    .trim()
    .isString()
    .withMessage(getErrorMessage("invalidFirstName")),

  body("lastName")
    .trim()
    .isString()
    .withMessage(getErrorMessage("invalidLastName")),

  body("dateOfBirth")
    .isString()
    .withMessage(getErrorMessage("invalidDateOfBirth")),

  body("personalId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage(getErrorMessage("invalidPersonalId"))
    .isLength({ min: 9, max: 20 })
    .withMessage(getErrorMessage("personalIdLength")),

  body("password")
    .isString()
    .withMessage(getErrorMessage("invalidPassword"))
    .isLength({ min: 8, max: 100 })
    .withMessage(getErrorMessage("passwordLength")),

  body("confirmPassword")
    .isString()
    .withMessage(getErrorMessage("invalidConfirmPassword"))
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw getErrorMessage("passwordsNotMatch");
      }
      return true;
    }),
];
