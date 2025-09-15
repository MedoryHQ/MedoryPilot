import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as FAQController from "@/controllers/admin/website/FAQ";
import { isAdminVerified } from "@/middlewares/admin";
import { fetchFAQValidation } from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminFAQRouter = Router();

adminFAQRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return FAQController.fetchFAQs(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminFAQRouter.get(
  "/:id",
  isAdminVerified,
  fetchFAQValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return FAQController.fetchFAQ(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
