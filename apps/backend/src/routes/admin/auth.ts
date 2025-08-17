import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as authController from "@/controllers/admin/auth";
import { loginValidation } from "@/validations/admin/";
import { adminAuthenticate } from "@/middlewares/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminAuthRouter = Router();

adminAuthRouter.post(
  "/login",
  loginValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return authController.login(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminAuthRouter.get(
  "/renew",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return authController.renew(req, res, next);
    } catch {
      return res
        .status(500)
        .json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
