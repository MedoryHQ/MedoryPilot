import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "../../utils";
import * as authController from "../../controllers/admin/auth";
import { loginValidation } from "../../validations/admin/";
import { validationResult } from "express-validator";
import { adminAuthenticate } from "../../middlewares/admin";

export const adminAuthRouter = Router();

adminAuthRouter.post(
  "/login",
  loginValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

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
