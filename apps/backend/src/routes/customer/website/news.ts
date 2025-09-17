import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as newsController from "@/controllers/customer/website/news";
import { validationHandler } from "@/middlewares/global/validationHandler";
import { fetchNewsValidation } from "@/validations/customer";

export const newsRouter = Router();

newsRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    return newsController.fetchNewses(req, res, next);
  } catch {
    res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
  }
});

newsRouter.get(
  "/:slug",
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
