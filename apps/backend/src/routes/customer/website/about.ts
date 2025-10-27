import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as aboutController from "@/controllers/customer/website/about";

export const aboutRouter = Router();

aboutRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return aboutController.fetchAbout(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
