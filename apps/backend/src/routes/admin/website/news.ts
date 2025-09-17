import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as newsController from "@/controllers/admin/website/news";
import { isAdminVerified } from "@/middlewares/admin";
import { fetchNewsValidation } from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminNewsRouter = Router();

adminNewsRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return newsController.fetchNewses(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminNewsRouter.get(
  "/:id",
  isAdminVerified,
  fetchNewsValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return newsController.fetchNews(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
