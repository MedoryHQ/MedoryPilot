import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "../../utils";
import * as userAuthController from "../../controllers/customer/auth";
import { userRegisterValidation } from "../../validations/customer";
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
