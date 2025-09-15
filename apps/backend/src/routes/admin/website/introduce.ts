import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as IntroduceController from "@/controllers/admin/website/introduce";
import { isAdminVerified } from "@/middlewares/admin";
import { fetchIntroduceValidation } from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminIntroduceRouter = Router();

adminIntroduceRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return IntroduceController.fetchIntroduces(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminIntroduceRouter.get(
  "/:id",
  isAdminVerified,
  fetchIntroduceValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return IntroduceController.fetchIntroduce(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
