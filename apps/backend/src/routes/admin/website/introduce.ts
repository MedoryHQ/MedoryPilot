import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as IntroduceController from "@/controllers/admin/website/introduce";
import { adminAuthenticate } from "@/middlewares/admin";
import {
  createIntroduceValidation,
  deleteIntroduceValidation,
  updateIntroduceValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminIntroduceRouter = Router();

adminIntroduceRouter.get(
  "/",
  adminAuthenticate,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return IntroduceController.fetchIntroduce(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminIntroduceRouter.delete(
  "/:id",
  adminAuthenticate,
  deleteIntroduceValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return IntroduceController.deleteIntroduce(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminIntroduceRouter.post(
  "/",
  adminAuthenticate,
  createIntroduceValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return IntroduceController.createIntroduce(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminIntroduceRouter.put(
  "/:id",
  adminAuthenticate,
  updateIntroduceValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return IntroduceController.updateIntroduce(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
