import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as overviewController from "@/controllers/admin/website/overview";
import { isAdminVerified } from "@/middlewares/admin";

export const adminOverviewRouter = Router();

adminOverviewRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return overviewController.fetchOverviews(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
