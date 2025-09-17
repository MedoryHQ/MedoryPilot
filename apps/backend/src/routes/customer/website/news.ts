import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as newsController from "@/controllers/customer/website/news";

export const newsRouter = Router();

newsRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    return newsController.fetchNewses(req, res, next);
  } catch {
    res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
  }
});
