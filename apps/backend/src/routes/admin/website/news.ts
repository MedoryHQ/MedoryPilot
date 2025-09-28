import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as newsController from "@/controllers/admin/website/news";
import { adminAuthenticate } from "@/middlewares/admin";
import {
  createNewsValidation,
  deleteNewsValidation,
  fetchNewsValidation,
  updateNewsValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminNewsRouter = Router();

adminNewsRouter.get(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return newsController.fetchNewses(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminNewsRouter.get(
  "/:slug",
  adminAuthenticate,
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

adminNewsRouter.delete(
  "/:slug",
  adminAuthenticate,
  deleteNewsValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return newsController.deleteNews(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminNewsRouter.post(
  "/",
  adminAuthenticate,
  createNewsValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return newsController.createNews(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminNewsRouter.put(
  "/:slug",
  adminAuthenticate,
  updateNewsValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return newsController.updateNews(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
