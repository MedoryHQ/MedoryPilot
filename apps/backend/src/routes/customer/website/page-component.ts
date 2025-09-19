import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as pageComponentController from "@/controllers/customer/website/pageComponent";

export const pageComponentRouter = Router();

pageComponentRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return pageComponentController.fetchPageComponents(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
