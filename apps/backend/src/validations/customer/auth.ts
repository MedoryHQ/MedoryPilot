import { body } from "express-validator";
import { prisma } from "../../config";
import { getResponseMessage } from "../../utils";

export const userRegisterValidation = [
  body("phoneNumber")
    .isString()
    .matches(/^\+9955\d{8}$/)
    .withMessage(getResponseMessage("invalidPhoneNumber"))
    .custom(async (_, { req }) => {
      const { phoneNumber } = req.body;
      const userExists = await prisma.user.count({
        where: { phoneNumber },
      });
      if (userExists) {
        return Promise.reject(getResponseMessage("phoneAlreadyExists"));
      }
    }),

  body("email")
    .optional()
    .isEmail()
    .withMessage(getResponseMessage("invalidEmail"))
    .custom(async (_, { req }) => {
      const { email } = req.body;
      if (!email) return true;
      const userExists = await prisma.user.count({
        where: { email },
      });
      if (userExists) {
        return Promise.reject(getResponseMessage("emailAlreadyExists"));
      }
    }),

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
        throw getResponseMessage("passwordsNotMatch");
      }
      return true;
    }),
];
