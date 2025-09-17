import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as newsController from "@/controllers/customer/website/news";
import { fetchNewsValidation } from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const newsRouter = Router();

newsRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    return newsController.fetchNewses(req, res, next);
  } catch {
    res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
  }
});

newsRouter.get(
  "/:id",
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
