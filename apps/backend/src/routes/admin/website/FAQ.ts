import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as FAQController from "@/controllers/admin/website/FAQ";
import { isAdminVerified } from "@/middlewares/admin";

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
