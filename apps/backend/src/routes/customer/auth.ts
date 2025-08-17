import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as userAuthController from "@/controllers/customer/auth";
import {
  userLoginValidation,
  userRegisterValidation,
  userVerifyValidation,
  resendUserVerificationCodeValidation,
  forgotUserPasswordValidation,
  forgotPasswordVerificationValidation,
  resetPasswordValidation,
  forgotUserPasswordWithEmailValidation,
} from "@/validations/customer";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const userAuthRouter = Router();

userAuthRouter.post(
  "/register",
  userRegisterValidation,
  validationHandler,

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return userAuthController.UserRegister(req, res, next);
    } catch (error) {
      return res
        .status(500)
        .json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

userAuthRouter.post(
  "/verify",
  userVerifyValidation,
  validationHandler,

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return userAuthController.UserVerify(req, res, next);
    } catch (error) {
      return res
        .status(500)
        .json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

userAuthRouter.post(
  "/login",
  userLoginValidation,
  validationHandler,

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return userAuthController.UserLogin(req, res, next);
    } catch (error) {
      return res
        .status(500)
        .json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

userAuthRouter.post(
  "/verification-resend",
  resendUserVerificationCodeValidation,
  validationHandler,

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return userAuthController.resendUserVerificationCode(req, res, next);
    } catch (error) {
      return res
        .status(500)
        .json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

userAuthRouter.post(
  "/forgot-password",
  forgotUserPasswordValidation,
  validationHandler,

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return userAuthController.forgotPassword(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

userAuthRouter.post(
  "/forgot-password/with-email",
  forgotUserPasswordWithEmailValidation,
  validationHandler,

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return userAuthController.forgotPasswordWithEmail(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

userAuthRouter.post(
  "/forgot-password-verification",
  forgotPasswordVerificationValidation,
  validationHandler,

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return userAuthController.forgotPasswordVerification(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

userAuthRouter.post(
  "/password-reset",
  resetPasswordValidation,
  validationHandler,

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return userAuthController.resetPassword(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

userAuthRouter.post(
  "/refresh-token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return userAuthController.refreshToken(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
