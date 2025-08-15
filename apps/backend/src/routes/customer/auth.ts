import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "../../utils";
import * as userAuthController from "../../controllers/customer/auth";
import {
  userLoginValidation,
  userRegisterValidation,
  userVerifyValidation,
  resendUserVerificationCodeValidation,
  forgotUserPasswordValidation,
  forgotPasswordVerificationValidation,
  resetPasswordValidation,
  forgotUserPasswordWithEmailValidation,
} from "../../validations/customer";
import { validationResult } from "express-validator";

export const userAuthRouter = Router();

userAuthRouter.post(
  "/register",
  userRegisterValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      return userAuthController.forgotPassword(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

userAuthRouter.post(
  "/forgot-password/with-email",
  forgotUserPasswordWithEmailValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      return userAuthController.forgotPasswordWithEmail(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

userAuthRouter.post(
  "/forgot-password-verification",
  forgotPasswordVerificationValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      return userAuthController.forgotPasswordVerification(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

userAuthRouter.post(
  "/password-reset",
  resetPasswordValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      return userAuthController.resetPassword(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
